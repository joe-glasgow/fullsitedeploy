import { aws_certificatemanager, aws_route53, aws_route53_patterns, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { CachePolicy, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { RedirectProtocol } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import CfBucketDistribution from "./cloudfront/distribution";
import S3Bucket from "./s3/bucket";

/**
 * The CloudFormation stack holding all our resources
 */
export default class DeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // replace this with your own domain name
    // TODO: replace with env variable
    const domainName = 'joemorrison.co.uk';
    // We retrieve the HostedZone associated with our domain by finding it via the domain name
    const hostedZone = aws_route53.HostedZone.fromLookup(this, 'website-hosted-zone', { domainName });
    // We then create a certificate to be used by the CloudFront distribution for this domain
    // The ownership of the domain will be validated by AWS via DNS entries in the HostedZone
    const certificate = new aws_certificatemanager.DnsValidatedCertificate(this, 'website-certificate', {
        domainName,
        hostedZone,
        region: 'us-east-1',
        subjectAlternativeNames: ["*." + domainName],
    });
    /**
     * The S3 Bucket hosting our build
     */
    const bucket = S3Bucket(this, domainName, {});
    const wwwBucket = S3Bucket(this, `www.${domainName}`, {
      websiteRedirect: { hostName: domainName, protocol: RedirectProtocol.HTTP }
    });
    /**
     * The CloudFront distribution caching and proxying our requests to our bucket
     */
    const distribution = CfBucketDistribution(this, "distribution", {
        domainNames: [domainName],
        certificate: certificate,
        defaultBehavior: {
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new S3Origin(bucket),
        cachePolicy: new CachePolicy(this, 'website-caching', {
            defaultTtl: Duration.minutes(1)
            }),
         },
        defaultRootObject: "index.html",
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

    // And lastly we need to tell Amazon Route 53 to forward traffic to the Amazon CloudFront distribution
    new aws_route53.ARecord(this, 'website-arecord', {
        zone: hostedZone,
        target: aws_route53.RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        ttl: Duration.minutes(1),
    });

    /**
    * Output the distribution's url so we can pass it to external systems
    */
    new CfnOutput(this, "DeploymentUrl", {
        value: "https://" + distribution.distributionDomainName
    });
    new CfnOutput(this, 'website-url', {
        value: domainName,
        description: 'The URL of your website',
        exportName: 'websiteUrl',
    });

    new CfnOutput(this, "wwwBucket", { value: wwwBucket.bucketArn })
  }
}
