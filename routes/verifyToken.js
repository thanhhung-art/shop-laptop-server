const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies["authtokenadmin"] || req.cookies["authtokenuser"];

  if (token) {
    jwt.verify(token, process.env.JWT_SECREC, (err, user) => {
      if (err) res.status(403).json("token is not valid");
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({msg: "you are not authorized"});
  }
};

const verifyTokenAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
    if (req.user._id === req.params.id || req.user.isadmin) {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};

const verifyTokenAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isadmin) {
      next();
    } else {
      res.status(403).json("you are not allowed to do that");
    }
  });
};

module.exports = { verifyToken, verifyTokenAuthorization, verifyTokenAdmin };
