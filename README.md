# fulib.org

[![Java CI](https://github.com/fujaba/fulib.org/workflows/Java%20CI/badge.svg)](https://github.com/fujaba/fulib.org/actions)

A web app for [fulibScenarios](https://github.com/fujaba/fulibScenarios).
Available at https://www.fulib.org.

## Building & Running

You can mostly set up this project after cloning using the Gradle import feature of your IDE.
Some additional steps are required and described below.

### MongoDB

Note that in order to run the server locally, you need to install MongoDB (server).
Then, create a user (with `mongosh`):

```js
db.createUser({
  user: "fulibDotOrg",
  pwd: "fulibDotOrg",
  roles: [
    { role: "readWrite", db: "fulib-org" }
  ]
})
```

> You can also select your own username and password.

### Frontend

To set up the frontend, cd into the `frontend/` directory and run (you may need to install [pnpm](https://pnpm.io/) first):

```sh
pnpm install
```

Then, run the frontend using the launch configuration or `pnpm run start:dev`.

> IMPORTANT: If the frontend errors along the lines of `** is not an NgModule` or similar, just restart the Angular dev server.

The frontend will be available at `http://localhost:11340`.

### Backend

Make sure you set the following environment variables before running:

```properties
FULIB_ORG_MONGODB_USER=fulibDotOrg
FULIB_ORG_MONGODB_HOST=localhost
FULIB_ORG_MONGODB_PASSWORD=fulibDotOrg
```

> If you selected a custom username and password in the step above,
> use them instead of `fulibDotOrg` in the env variables, too!

IntelliJ users can also use the predefined run configurations with the above environment variables already set.

### Projects Backend

To run the Projects backend, you need to set the following environment variables:

```
FULIB_MONGO_URL=mongodb://fulibDotOrg:fulibDotOrg@localhost
FULIB_PROJECTS_URL=http://host.docker.internal:4567
FULIB_PROJECTS_PROXY_URL=http://localhost:8080
FULIB_PROJECTS_CONTAINER_IMAGE=fulib/fulib.org-projects
```

> Replace `fulibDotOrg` in the `FULIB_MONGO_URL` if you set a custom username or password.

IntelliJ users can also use the predefined run configuration with the above environment variables already set.

### Projects Proxy

You can start the Project Proxy by running `docker compose up` in the `projects-proxy` directory.

### Projects Runtime Image

You need to prepare the runtime image to run Project containers.
Run the following commands, or perform the steps manually:

```
rm projects/build/libs/* # delete existing jar files
gradle :projects:build   # build new jar files
docker build -t fulib/fulib.org-projects projects # prepare docker image
```

## License

[MIT](LICENSE.md)
