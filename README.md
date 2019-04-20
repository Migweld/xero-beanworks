# Xero-Beanworks test integration

A NodeJS (Express) & MongoDB based implementation of an API to connect to the Xero accounting service and retrieve Vendor and Account information

### Assumptions

- Vendors are those contacts in Xero with the `IsSupplier` flag set to `true`
- No sample data is provided for `ContactGroups` or `AccountGroups`, as such these have been omitted
- The Xero app is public, as opposed to private, as such a consumer key/secret key oAuth1 config has been used
- Duplicates are not to be stored

### Testing

- Clone the repo
- `yarn (or npm) test`

### Deployment

- Ensure latest Docker and docker-compose are installed.
- `cd` to root directory
- Create a `.env` file with the following information (the file has been committed to the repo in this example in order to fetch the sample data):

```
XERO_CALLBACK_URL=
XERO_CONSUMER_KEY=
XERO_SECRET_KEY=
```

- Run `docker-compose build` to dockerise the app
- Run `docker-compose up`
- Proxy connections to port 3000 on the Docker container (default `localhost`)
