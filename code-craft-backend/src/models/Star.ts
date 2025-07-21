import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStar extends Document {
  userId: Types.ObjectId;
  snippetId: Types.ObjectId;
  createdAt: Date;
}

export interface IStarStatics {
  toggle(userId: string, snippetId: string): Promise<{ isStarred: boolean; starCount: number }>;
  isStarredBy(userId: string, snippetId: string): Promise<boolean>;
  getStarCount(snippetId: string): Promise<number>;
  getUserStarredSnippets(userId: string, page?: number, limit?: number): Promise<{
    snippets: any[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}

export type StarModel = mongoose.Model<IStar> & IStarStatics;

const starSchema = new Schema<IStar, StarModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    snippetId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Snippet',
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
starSchema.index({ userId: 1, snippetId: 1 }, { unique: true });
starSchema.index({ userId: 1 });
starSchema.index({ snippetId: 1 });

// Static methods
starSchema.statics.toggle = async function(userId: string, snippetId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const snippetObjectId = new mongoose.Types.ObjectId(snippetId);

  // Try to find existing star
  const existingStar = await this.findOne({
    userId: userObjectId,
    snippetId: snippetObjectId,
  });

  let isStarred: boolean;

  if (existingStar) {
    // Remove star
    await this.deleteOne({ _id: existingStar._id });
    isStarred = false;
  } else {
    // Add star
    await this.create({
      userId: userObjectId,
      snippetId: snippetObjectId,
    });
    isStarred = true;
  }

  // Get updated star count
  const starCount = await this.countDocuments({ snippetId: snippetObjectId });

  return { isStarred, starCount };
};

starSchema.statics.isStarredBy = async function(userId: string, snippetId: string) {
  const star = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    snippetId: new mongoose.Types.ObjectId(snippetId),
  });
  return !!star;
};

starSchema.statics.getStarCount = async function(snippetId: string) {
  return this.countDocuments({ snippetId: new mongoose.Types.ObjectId(snippetId) });
};

starSchema.statics.getUserStarredSnippets = async function(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [stars, total] = await Promise.all([
    this.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'snippetId',
        select: 'title language code userName createdAt',
      }),
    this.countDocuments({ userId: userObjectId }),
  ]);

  const snippets = stars.map(star => star.snippetId);

  return {
    snippets,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const Star = mongoose.model<IStar, StarModel>('Star', starSchema);