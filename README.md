# Full Site Deploy

A sample application that provides AWS preview environments and a deploy step using Github Actions. 

Please see 'infrastructure/README' for more information.

Requires [Github OICD](https://www.eliasbrange.dev/posts/secure-aws-deploys-from-github-actions-with-oidc/) integration with an AWS session / account role set up in IAM.

This sample application deploys a static s3 website, with a hosted domain from Route53 in front of a Cloudfront Distribution. 

This examples uses CDK in Typescript flavour.

Locally assumes CDK v2.61.1 and Node v18 (LTS)