import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import CfBucketDistribution from "./cloudfront/distribution";
import S3Bucket from "./s3/bucket";

/**
 * The CloudFormation stack holding all our resources
 */
export default class SitePreviewStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * The S3 Bucket hosting our build
     */
    const bucket = S3Bucket(this, "bucket", {});

    /**
     * The CloudFront distribution caching and proxying our requests to our bucket
     */
    const distribution = CfBucketDistribution(this, "distribution", {
      defaultBehavior: {
        origin: new S3Origin(bucket),
    },
    defaultRootObject: "index.html",
  });

    /**
     * Output the distribution's url so we can pass it to external systems
     */
    new CfnOutput(this, "DeploymentUrl", {
      value: "https://" + distribution.distributionDomainName
    });

    /**
     * Upload our build to the bucket and invalidate the distribution's cache
     */
    new BucketDeployment(this, "BucketDeployment", {
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/", "/index.html"],
      sources: [Source.asset('../website')],
    });
  }
}
