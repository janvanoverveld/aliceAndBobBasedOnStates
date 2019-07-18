# aliceAndBobBasedOnStates

Alice and bob example implemented based on a transition state diagram.

To execute the code make sure you have installed node.js and TypeScript.

It is assumed Typescript is installed globally (npm install -g typescript) 

After cloning the github repo, install the additional modules specified in package.json.

1. run 'npm install' in the root of the repo (node_modules is created, this contains the extra needed modules and additional typings)
2. with tsc the .ts files are transpiled to .js files in the js directory
3. The code involves three seperated/distributed processes that communicate with each other(mediator, alice and bob)
   There are two ways of starting the code:
   a. first run mediator.js and then fred.js, bob.js, alice.js all in seperated node processes(seperated windows or background processes).
   b. or run node js/start.js, this starts all the distributed processes in the background, the logging can be found in the log directory.

extra
the command 'npm start'
will clean, transpile and execute everything
