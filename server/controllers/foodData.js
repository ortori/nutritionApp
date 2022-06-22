const { read } = require("fs");
const path = require("path");
const axios = require("axios").default;
const { getConnectedUser } = require("./users");
const {
  pushDataToDatabase,
  getProperty,
  displayAllFood,
} = require("../../database/usersAuth");

const getHomePage = (req, res) => {
  if (!getConnectedUser()) {
    res.status(405);
    res.redirect("/users/login");
    return;
  }
  res.render("../views/homepage.ejs", { data: null });
};

let displayFoodToUser = displayAllFood()
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
console.log(displayAllFood);

const getFoodData = async (req, res) => {
  const { searchFood, grams } = req.body;
  const { data } = await axios({
    method: "post",
    url: "https://trackapi.nutritionix.com/v2/natural/nutrients",
    data: {
      query: `${searchFood} ${grams} grams`,
    },
    headers: {
      "Content-Type": "application/json",
      "x-app-id": "a107cf34",
      "x-app-key": "32d7bcf14e2ddab57b25974ee868d5a1",
      "x-remote-user-id": "0",
    },
  });

  res.render("../views/homepage.ejs", { data: data.foods[0] });

  //Verify current user
  const user_id = getProperty(
    "user_id",
    { username: getConnectedUser() },
    "users"
  );

  //Push to DB
  const {
    food_name,
    nf_calories,
    serving_weight_grams,
    nf_total_carbohydrate,
    nf_protein,
  } = data.foods[0];

  pushDataToDatabase(
    {
      user_id,
      food_name,
      nf_calories,
      nf_protein: parseInt(nf_protein),
      serving_weight_grams,
      nf_total_carbohydrate: parseInt(nf_total_carbohydrate),
    },
    "foods"
  );

  // res.json(data.foods[0]);
  // createImage().then((img) => {
  //   console.log(res);
  //   res.render("../views/homepage.ejs", { img });
  // });
};

module.exports = { getHomePage, getFoodData };
