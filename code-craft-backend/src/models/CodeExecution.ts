import mongoose, { Document, Schema, Types } from 'mongoose';
import { getSupportedLanguageIds } from '../utils/constants';

export interface ICodeExecution extends Document {
  userId: Types.ObjectId;
  language: string;
  code: string;
  output?: string;
  error?: string;
  executionTime?: number;
  createdAt: Date;
}

export interface ICodeExecutionStatics {
  getUserStats(userId: string): Promise<any>;
  getRecentExecutions(userId: string, limit: number): Promise<ICodeExecution[]>;
}

export type CodeExecutionModel = mongoose.Model<ICodeExecution> & ICodeExecutionStatics;

const codeExecutionSchema = new Schema<ICodeExecution, CodeExecutionModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    language: {
      type: String,
      required: true,
      validate: {
        validator: function(value: string) {
          return getSupportedLanguageIds().includes(value);
        },
        message: 'Invalid language. Must be one of the supported languages.',
      },
    },
    code: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    output: {
      type: String,
      maxlength: 10000,
    },
    error: {
      type: String,
      maxlength: 10000,
    },
    executionTime: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: function(doc, ret: Record<string, any>) {
        const { __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Indexes
codeExecutionSchema.index({ userId: 1 });
codeExecutionSchema.index({ userId: 1, createdAt: -1 });
codeExecutionSchema.index({ createdAt: -1 });
codeExecutionSchema.index({ language: 1 });

// Static methods
codeExecutionSchema.statics.getUserStats = async function(userId: string) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalExecutions: { $sum: 1 },
        languages: { $addToSet: '$language' },
        languageCounts: {
          $push: {
            language: '$language',
            count: 1,
          },
        },
        avgExecutionTime: { $avg: '$executionTime' },
        last24Hours: {
          $sum: {
            $cond: [
              {
                $gte: [
                  '$createdAt',
                  new Date(Date.now() - 24 * 60 * 60 * 1000),
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalExecutions: 1,
        languagesUsed: { $size: '$languages' },
        avgExecutionTime: { $round: ['$avgExecutionTime', 2] },
        last24Hours: 1,
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalExecutions: 0,
    languagesUsed: 0,
    avgExecutionTime: 0,
    last24Hours: 0,
  };
};

codeExecutionSchema.statics.getRecentExecutions = function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('language code output error executionTime createdAt');
};

export const CodeExecution = mongoose.model<ICodeExecution, CodeExecutionModel>(
  'CodeExecution',
  codeExecutionSchema
);