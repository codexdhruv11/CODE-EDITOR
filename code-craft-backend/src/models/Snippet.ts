import mongoose, { Document, Schema, Types } from 'mongoose';
import { getSupportedLanguageIds } from '../utils/constants';

export interface ISnippet extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  programmingLanguage: string;
  code: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
  starCount: number;
  commentCount: number;
  isOwnedBy(userId: string): boolean;
}

export interface ISnippetMethods {
  isOwnedBy(userId: string): boolean;
}

export type SnippetModel = mongoose.Model<ISnippet, {}, ISnippetMethods>;

const snippetSchema = new Schema<ISnippet, SnippetModel, ISnippetMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    programmingLanguage: {
      type: String,
      required: true,
      validate: {
        validator: function(value: string) {
          return getSupportedLanguageIds().includes(value);
        },
        message: 'Invalid programming language. Must be one of the supported languages.',
      },
    },
    code: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret: Record<string, any>) {
        const { __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Indexes
snippetSchema.index({ userId: 1 });
snippetSchema.index({ createdAt: -1 });
snippetSchema.index({ title: 'text' });
snippetSchema.index({ programmingLanguage: 1 });
snippetSchema.index({ userId: 1, createdAt: -1 });

// Virtual fields
snippetSchema.virtual('starCount', {
  ref: 'Star',
  localField: '_id',
  foreignField: 'snippetId',
  count: true,
});

snippetSchema.virtual('commentCount', {
  ref: 'SnippetComment',
  localField: '_id',
  foreignField: 'snippetId',
  count: true,
});

// Instance methods
snippetSchema.methods.isOwnedBy = function(userId: string): boolean {
  return this.userId.toString() === userId;
};

export const Snippet = mongoose.model<ISnippet, SnippetModel>('Snippet', snippetSchema);