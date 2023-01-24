import { aws_cloudfront as cloudfront, aws_cloudfront_origins as cloudfrontOrigins, Stack} from "aws-cdk-lib"
import { DistributionProps } from "aws-cdk-lib/aws-cloudfront";

const CfBucketDistribution  = (stack: Stack, name: string, props: DistributionProps) => new cloudfront.Distribution(stack, name, props)

export default CfBucketDistribution;