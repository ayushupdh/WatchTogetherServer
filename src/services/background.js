const User = require("../models/user");
// removes the oldest 10 movies from the disliked_movies
const runBG_RemoveOldDislikedMovies = async (user) => {
  try {
    if (user.disliked_movies.length > 75) {
      await User.updateMany({ _id: user._id }, [
        {
          $set: {
            disliked_movies: {
              $slice: [
                "$disliked_movies",
                { $add: [1, 10] },
                { $size: "$disliked_movies" },
              ],
            },
          },
        },
      ]);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { runBG_RemoveOldDislikedMovies };
