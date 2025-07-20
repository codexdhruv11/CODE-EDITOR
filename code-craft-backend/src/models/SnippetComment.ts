import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISnippetComment extends Document {
  snippetId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isOwnedBy(userId: string): boolean;
}

export interface ISnippetCommentMethods {
  isOwnedBy(userId: string): boolean;
}

export interface ISnippetCommentStatics {
  getBySnippetId(snippetId: string, page?: number, limit?: number): Promise<{
    comments: ISnippetComment[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}

export type SnippetCommentModel = mongoose.Model<ISnippetComment, {}, ISnippetCommentMethods> & ISnippetCommentStatics;

const snippetCommentSchema = new Schema<ISnippetComment, SnippetCommentModel, ISnippetCommentMethods>(
  {
    snippetId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Snippet',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
snippetCommentSchema.index({ snippetId: 1 });
snippetCommentSchema.index({ snippetId: 1, createdAt: -1 });
snippetCommentSchema.index({ userId: 1 });

// Instance methods
snippetCommentSchema.methods.isOwnedBy = function(userId: string): boolean {
  return this.userId.toString() === userId;
};

// Static methods
snippetCommentSchema.statics.getBySnippetId = async function(
  snippetId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  
  const [comments, total] = await Promise.all([
    this.find({ snippetId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),
    this.countDocuments({ snippetId }),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const SnippetComment = mongoose.model<ISnippetComment, SnippetCommentModel>(
  'SnippetComment',
  snippetCommentSchema
);