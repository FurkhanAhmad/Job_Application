import { Document} from "mongoose";
import {Schema,Prop,SchemaFactory} from "@nestjs/mongoose"
import mongoose from "mongoose";
import { Job } from "./job.model";
import { User } from "./user.model";
export type ApplicationDocument=Application & Document;

@Schema({timestamps:true})
export class Application{
 @Prop({type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true})
 job!:Job

 @Prop({type:mongoose.Schema.Types.ObjectId,ref:'User'})
 applicat!:User
 @Prop({type:String, enum: ['pending','accepted','rejected'], default: 'pending'})
 status!: string

}

export const ApplicationSchema = SchemaFactory.createForClass(Application);