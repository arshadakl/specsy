const isLogin = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
    } else {
      return res.redirect("/admin/login");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};
const jsonIsLogin = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
    } else {
      return res.json({ auth: 0 });
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      return res.redirect("/");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};
// image uploads

module.exports = {
  isLogin,
  isLogout,
  jsonIsLogin,
};
