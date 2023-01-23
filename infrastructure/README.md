# Site Preview

Uses Github Actions to deploy a preview environment of a static website to AWS.
Heavily borrowed from Julien Goux and his amazing example: https://github.com/jgoux/preview-environments-per-pull-request-using-aws-cdk-and-github-actions#cdk


## Structure

The `website` folder contains an example of a static `index.html` folder to serve up content

Within `lib`, the `sitepreview-stack` creates a new Cloudfront distribution which points to an s3 butcket serving our static `website` folder.

## How it works

If this is your first time using the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html), you will have to bootstrap your AWS environment first: 

    $ CDK_NEW_BOOTSTRAP=1 cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess

The Github Actions within `.github/workflows` are responsible for ultimately deploying our code to AWS.

There are `deploy`, `postdeploy` and `destroy` stages used in the actions, detailed in `package.json`. Succinctly, these are called to create or destroy the preview environment based on the `STAGE` variable which is a string, comprising the PR number and branch name. 

### Action: Pull Request Deploy

Any Pull Requests containing: " :rocket: deploy " as a label will trigger this action.

The job configures AWS credentials, in this case using OIDC and an IAM Role - https://www.automat-it.com/post/using-github-actions-with-aws-iam-roles , replacing: 

    ${{ secrets.AWS_ROLE_ARN }} 
    
in your [Github Action](https://docs.github.com/en/actions/security-guides/encrypted-secrets) secrets with the ARN of your own github-actions-role. 

You may need to add additional policies to this role depending on the actions of your stack. You may need to an inline policy for `sts::AssumeRole`. 
### Action: Pull Request Cleanup

Removal of the deploy label (or merge/delete) of the deplyed Pull Request will call this action into play.

It will trigger the `cdk destroy` command in package.json and tear down your environment

