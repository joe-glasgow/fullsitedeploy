import { Stack } from 'aws-cdk-lib';
import { Bucket, BucketProps } from 'aws-cdk-lib/aws-s3';
import * as cdk from "@aws-cdk/core";
import { Construct } from "@aws-cdk/core";


const S3Bucket  = (stack: Stack, name: string, props: BucketProps = {}) => new Bucket(stack, name, props)

export default S3Bucket