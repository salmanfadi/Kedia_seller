import Amplify from 'aws-amplify';

Amplify.configure({
  Storage: {
    AWSS3: {
      bucket: 'tnn-app-test', // Your bucket name
      region: 'us-east-1',    // Your bucket's region
    },
  },
});
