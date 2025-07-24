import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): any;
  comparePassword(password: string): Promise<boolean>;
  _id: mongoose.Types.ObjectId;
}

export interface IUserMethods {
  isOwnedBy(userId: string): boolean;
  comparePassword(password: string): Promise<boolean>;
}

export interface IUserStatics {
  findByEmail(email: string): Promise<IUser | null>;
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

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
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

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// Custom toJSON method
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  const { __v, ...rest } = userObject;
  return rest;
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);