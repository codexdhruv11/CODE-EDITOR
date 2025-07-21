import { User, Snippet, CodeExecution, SnippetComment, Star } from '../../src/models';
import { createTestUser, createTestSnippet } from '../setup';

describe('Models Unit Tests', () => {
  describe('User Model', () => {
    it('should create a user with required fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'Test User',
      };

      const user = new User(userData);
      await user.save();

      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      // Password should be hashed
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'PlainTextPassword',
        name: 'Test User',
      };

      const user = new User(userData);
      await user.save();

      // Password should be hashed, not plain text
      expect(user.password).not.toBe('PlainTextPassword');
      expect(user.password.length).toBeGreaterThan(20); // Bcrypt hashes are longer
    });

    it('should validate password correctly', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'Test User',
      };

      const user = new User(userData);
      await user.save();

      // Correct password should validate
      const isValidCorrect = await user.comparePassword('TestPassword123');
      expect(isValidCorrect).toBe(true);

      // Incorrect password should not validate
      const isValidIncorrect = await user.comparePassword('WrongPassword');
      expect(isValidIncorrect).toBe(false);
    });

    it('should enforce unique email', async () => {
      const email = 'duplicate@example.com';
      
      await User.create({
        email,
        password: 'TestPassword123',
        name: 'User 1',
      });

      const duplicateUser = new User({
        email,
        password: 'TestPassword123',
        name: 'User 2',
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should have findByEmail static method', async () => {
      const user = await createTestUser();
      const foundUser = await User.findByEmail(user.email);
      
      expect(foundUser).toBeDefined();
      expect(foundUser!._id.toString()).toBe(user._id.toString());
    });

    it('should have isOwnedBy instance method', async () => {
      const user = await createTestUser();
      
      expect(user.isOwnedBy(user._id.toString())).toBe(true);
      expect(user.isOwnedBy('different-user-id')).toBe(false);
    });
  });

  describe('Snippet Model', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should create a snippet with required fields', async () => {
      const snippetData = {
        userId: testUser._id,
        title: 'Test Snippet',
        language: 'javascript',
        code: 'console.log("Hello");',
        userName: testUser.name,
      };

      const snippet = new Snippet(snippetData);
      await snippet.save();

      expect(snippet.title).toBe(snippetData.title);
      expect(snippet.language).toBe(snippetData.language);
      expect(snippet.code).toBe(snippetData.code);
      expect(snippet.userName).toBe(snippetData.userName);
    });

    it('should validate supported languages', async () => {
      const snippet = new Snippet({
        userId: testUser._id,
        title: 'Test',
        language: 'unsupported-language',
        code: 'some code',
        userName: testUser.name,
      });

      await expect(snippet.save()).rejects.toThrow();
    });

    it('should accept all supported languages without premium restrictions', async () => {
      const languages = [
        'javascript', 'typescript', 'python', 'java', 'go',
        'rust', 'cpp', 'csharp', 'ruby', 'swift'
      ];

      for (const language of languages) {
        const snippet = new Snippet({
          userId: testUser._id,
          title: `Test ${language} Snippet`,
          language,
          code: `// ${language} code`,
          userName: testUser.name,
        });

        await expect(snippet.save()).resolves.toBeDefined();
      }
    });

    it('should have isOwnedBy instance method', async () => {
      const snippet = await createTestSnippet(testUser._id);
      
      expect(snippet.isOwnedBy(testUser._id.toString())).toBe(true);
      expect(snippet.isOwnedBy('different-user-id')).toBe(false);
    });

    it('should enforce title length limit', async () => {
      const longTitle = 'a'.repeat(101);
      
      const snippet = new Snippet({
        userId: testUser._id,
        title: longTitle,
        language: 'javascript',
        code: 'console.log("test");',
        userName: testUser.name,
      });

      await expect(snippet.save()).rejects.toThrow();
    });
  });

  describe('CodeExecution Model', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should create a code execution record', async () => {
      const executionData = {
        userId: testUser._id,
        language: 'javascript',
        code: 'console.log("Hello");',
        output: 'Hello\n',
        executionTime: 150,
      };

      const execution = new CodeExecution(executionData);
      await execution.save();

      expect(execution.language).toBe(executionData.language);
      expect(execution.code).toBe(executionData.code);
      expect(execution.output).toBe(executionData.output);
      expect(execution.executionTime).toBe(executionData.executionTime);
    });

    it('should validate supported languages', async () => {
      const execution = new CodeExecution({
        userId: testUser._id,
        language: 'unsupported-language',
        code: 'some code',
      });

      await expect(execution.save()).rejects.toThrow();
    });

    it('should allow all supported languages without restrictions', async () => {
      const languages = [
        'javascript', 'typescript', 'python', 'java', 'go',
        'rust', 'cpp', 'csharp', 'ruby', 'swift'
      ];

      for (const language of languages) {
        const execution = new CodeExecution({
          userId: testUser._id,
          language,
          code: `// ${language} code`,
          output: `${language} output`,
          executionTime: 100,
        });

        await expect(execution.save()).resolves.toBeDefined();
      }
    });

    it('should have getUserStats static method', async () => {
      // Create some test executions
      await CodeExecution.create({
        userId: testUser._id,
        language: 'javascript',
        code: 'console.log("test1");',
        output: 'test1',
        executionTime: 100,
      });

      await CodeExecution.create({
        userId: testUser._id,
        language: 'python',
        code: 'print("test2")',
        output: 'test2',
        executionTime: 200,
      });

      const stats = await CodeExecution.getUserStats(testUser._id.toString());

      expect(stats.totalExecutions).toBe(2);
      expect(stats.languagesUsed).toBe(2);
      expect(stats.avgExecutionTime).toBe(150);
    });

    it('should have getRecentExecutions static method', async () => {
      // Create test executions
      await CodeExecution.create({
        userId: testUser._id,
        language: 'javascript',
        code: 'console.log("recent1");',
        output: 'recent1',
      });

      await CodeExecution.create({
        userId: testUser._id,
        language: 'python',
        code: 'print("recent2")',
        output: 'recent2',
      });

      const recentExecutions = await CodeExecution.getRecentExecutions(testUser._id.toString(), 5);

      expect(recentExecutions).toHaveLength(2);
      expect(recentExecutions[0].createdAt.getTime()).toBeGreaterThanOrEqual(recentExecutions[1].createdAt.getTime());
    });
  });

  describe('Star Model', () => {
    let testUser: any;
    let testSnippet: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testSnippet = await createTestSnippet(testUser._id);
    });

    it('should create a star', async () => {
      const star = new Star({
        userId: testUser._id,
        snippetId: testSnippet._id,
      });

      await star.save();

      expect(star.userId.toString()).toBe(testUser._id.toString());
      expect(star.snippetId.toString()).toBe(testSnippet._id.toString());
    });

    it('should enforce unique user-snippet combination', async () => {
      await Star.create({
        userId: testUser._id,
        snippetId: testSnippet._id,
      });

      const duplicateStar = new Star({
        userId: testUser._id,
        snippetId: testSnippet._id,
      });

      await expect(duplicateStar.save()).rejects.toThrow();
    });

    it('should have toggle static method', async () => {
      // First toggle - should create star
      const result1 = await Star.toggle(testUser._id.toString(), testSnippet._id.toString());
      expect(result1.isStarred).toBe(true);
      expect(result1.starCount).toBe(1);

      // Second toggle - should remove star
      const result2 = await Star.toggle(testUser._id.toString(), testSnippet._id.toString());
      expect(result2.isStarred).toBe(false);
      expect(result2.starCount).toBe(0);
    });

    it('should have isStarredBy static method', async () => {
      expect(await Star.isStarredBy(testUser._id.toString(), testSnippet._id.toString())).toBe(false);

      await Star.create({
        userId: testUser._id,
        snippetId: testSnippet._id,
      });

      expect(await Star.isStarredBy(testUser._id.toString(), testSnippet._id.toString())).toBe(true);
    });

    it('should have getStarCount static method', async () => {
      expect(await Star.getStarCount(testSnippet._id.toString())).toBe(0);

      await Star.create({
        userId: testUser._id,
        snippetId: testSnippet._id,
      });

      expect(await Star.getStarCount(testSnippet._id.toString())).toBe(1);
    });
  });

  describe('SnippetComment Model', () => {
    let testUser: any;
    let testSnippet: any;

    beforeEach(async () => {
      testUser = await createTestUser();
      testSnippet = await createTestSnippet(testUser._id);
    });

    it('should create a comment', async () => {
      const commentData = {
        snippetId: testSnippet._id,
        userId: testUser._id,
        userName: testUser.name,
        content: 'This is a test comment',
      };

      const comment = new SnippetComment(commentData);
      await comment.save();

      expect(comment.content).toBe(commentData.content);
      expect(comment.userName).toBe(commentData.userName);
    });

    it('should have isOwnedBy instance method', async () => {
      const comment = new SnippetComment({
        snippetId: testSnippet._id,
        userId: testUser._id,
        userName: testUser.name,
        content: 'Test comment',
      });

      await comment.save();

      expect(comment.isOwnedBy(testUser._id.toString())).toBe(true);
      expect(comment.isOwnedBy('different-user-id')).toBe(false);
    });

    it('should enforce content length limit', async () => {
      const longContent = 'a'.repeat(1001);
      
      const comment = new SnippetComment({
        snippetId: testSnippet._id,
        userId: testUser._id,
        userName: testUser.name,
        content: longContent,
      });

      await expect(comment.save()).rejects.toThrow();
    });

    it('should have getBySnippetId static method', async () => {
      await SnippetComment.create({
        snippetId: testSnippet._id,
        userId: testUser._id,
        userName: testUser.name,
        content: 'Comment 1',
      });

      await SnippetComment.create({
        snippetId: testSnippet._id,
        userId: testUser._id,
        userName: testUser.name,
        content: 'Comment 2',
      });

      const result = await SnippetComment.getBySnippetId(testSnippet._id.toString(), 1, 10);

      expect(result.comments).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });
});