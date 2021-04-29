# fulib.org

[![Java CI](https://github.com/fujaba/fulib.org/workflows/Java%20CI/badge.svg)](https://github.com/fujaba/fulib.org/actions)

A web app for [fulibScenarios](https://github.com/fujaba/fulibScenarios).
Available at https://www.fulib.org.

## Building & Running

### General

You can simply set up this project after cloning using the Gradle import feature of your IDE.

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
```

> Replace `fulibDotOrg` in the `FULIB_MONGO_URL` if you set a custom username or password.

IntelliJ users can also use the predefined run configuration with the above environment variables already set.

### Projects Proxy

You can start the Project Proxy by running `docker compose up` in the `projects-proxy` directory.

## License

[MIT](LICENSE.md)
