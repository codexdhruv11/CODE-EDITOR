import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  passwordChangedAt?: Date;
  sessionTokens: string[];
  toJSON(): any;
  comparePassword(password: string): Promise<boolean>;
  _id: mongoose.Types.ObjectId;
}

export interface IUserMethods {
  isOwnedBy(userId: string): boolean;
  comparePassword(password: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  invalidateTokensBeforePasswordChange(): Promise<void>;
}

export interface IUserStatics {
  findByEmail(email: string): Promise<IUser | null>;
  comparePasswordStatic(password: string, hash: string): Promise<boolean>;
}

export type UserModel = mongoose.Model<IUser, {}, IUserMethods> & IUserStatics;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
      default: '',
    },
    failedLoginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
      required: false,
    },
    passwordChangedAt: {
      type: Date,
      required: false,
    },
    sessionTokens: {
      type: [String],
      required: true,
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret: Record<string, any>) {
        const { __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

// Account lockout constants
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours
const MAX_LOGIN_ATTEMPTS = 5;

// Virtual for checking if account is currently locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Track password change time for session invalidation
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
      // Clear all session tokens on password change
      this.sessionTokens = [];
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
userSchema.methods.isOwnedBy = function(userId: string): boolean {
  return this._id instanceof mongoose.Types.ObjectId && this._id.toString() === userId;
};

userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Increment login attempts and lock account if necessary
userSchema.methods.incLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
    return;
  }
  
  // Otherwise we're incrementing
  const updates: any = { $inc: { failedLoginAttempts: 1 } };
  
  // Lock the account after reaching max attempts
  if (this.failedLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }
  
  await this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  await this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Invalidate tokens before password change
userSchema.methods.invalidateTokensBeforePasswordChange = async function(): Promise<void> {
  this.passwordChangedAt = new Date();
  this.sessionTokens = [];
  await this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email }).select('+password');
};

userSchema.statics.comparePasswordStatic = async function(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
};

// Custom toJSON method
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  const { __v, ...rest } = userObject;
  return rest;
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);