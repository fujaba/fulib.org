# fulib.org

[![Deploy](https://github.com/fujaba/fulib.org/actions/workflows/deploy.yml/badge.svg)](https://github.com/fujaba/fulib.org/actions)
[![Test](https://github.com/fujaba/fulib.org/actions/workflows/test.yml/badge.svg)](https://github.com/fujaba/fulib.org/actions)
[![CodeQL](https://github.com/fujaba/fulib.org/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/fujaba/fulib.org/actions)

A web app for grading programming assignments and an online IDE.
Available at https://fulib.org.

## Running with Docker-Compose

### Assignments

To run a local semi-production Assignment/fulibFeedback environment in a docker-compose environment, use the following command:

```shell
docker compose -f docker-compose.yml -f docker-compose.assignments.yml up -d
```

The frontend will be available at http://localhost:11340.

## Building & Running

You can mostly set up this project after cloning using the Gradle import feature of your IDE.
Some additional steps are required and described below.

### MongoDB

Note that in order to run the server locally, you need to set up a MongoDB to run at `localhost:27017` (regular installation or Docker).

### Frontend

To set up the frontend, cd into the `frontend/` directory and run (you may need to install [pnpm](https://pnpm.io/) first):

```sh
pnpm install
```

Then, run the frontend using the launch configuration or `pnpm run start:dev`.

> ⚠️ If the frontend errors along the lines of `XY is not an NgModule` or `Uncaught Error: Type XYModule does not have 'ɵmod' property.` similar, just restart the Angular dev server.

The frontend will be available at http://localhost:11340.

### Projects Backend

IntelliJ users can use the predefined run configuration with the above environment variables already set.

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
