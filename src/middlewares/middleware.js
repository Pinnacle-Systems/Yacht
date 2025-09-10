const middleware = {
    TokenAuthentication: (request, response, next) => {
        try {
            //   get the token from the authorization header
            const token = request.headers.authorization.split(" ")[1];
            console.log("token", token);

            //check if the token matches the supposed origin
            const decodedToken = verify(token, "RANDOM-TOKEN");

            // retrieve the user details of the logged in user
            const user = decodedToken;

            console.log("user", decodedToken);

            // pass the user down to the endpoints here
            request.user = user;

            // pass down functionality to the endpoint
            next();

        } catch (error) {
            response.status(401).json({
                error: new Error("Invalid request!"),
            });
        }
    },
    RequestValidation: (schema, property) => {
        return (req, res, next) => {
            const { error } = validate(req[property], schema);
            const valid = error == null;
            if (valid) { next(); }
            else {
                const { details } = error;
                const message = details.map(i => i.message).join(',')
                console.log("error", message);
                res.status(422).json({ error: message })
            }
        }
    }
}
export default middleware