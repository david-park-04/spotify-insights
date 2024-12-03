//
// Request coming in from the client
//
exports.get_login = async(req, res) => {
    
    console.log("** Call to get /login url...");

    try {
        console.log("hello");
    }
    catch(err) {
        console.log("** Error in /login");
        console.log(err.message);
    }
};