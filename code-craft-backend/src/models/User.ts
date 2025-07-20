import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): any;
}

export interface IUserMethods {
  isOwnedBy(userId: string): boolean;
}

export interface IUserStatics {
  findByClerkId(clerkId: string): Promise<IUser | null>;
}

export type UserModel = mongoose.Model<IUser, {}, IUserMethods> & IUserStatics;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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
userSchema.index({ clerkId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

// Instance methods
userSchema.methods.isOwnedBy = function(userId: string): boolean {
  return this.clerkId === userId;
};

// Static methods
userSchema.statics.findByClerkId = function(clerkId: string) {
  return this.findOne({ clerkId });
};

// Custom toJSON method
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.__v;
  return userObject;
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);