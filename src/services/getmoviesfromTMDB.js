const api; // Get API FROM TMDB
const axios = require("axios");
const fs = require("fs");
let moviesJSON = fs.readFileSync("allData.json", "utf-8");
let movies = JSON.parse(moviesJSON);

const getProviders = async (data) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${data}/watch/providers?api_key=${api}`
    );
    const datas = [];
    if (
      response.data.results &&
      response.data.results.US &&
      response.data.results.US.flatrate
    ) {
      datas.push(...response.data.results.US.flatrate);
    }
    if (
      response.data.results &&
      response.data.results.US &&
      response.data.results.US.ads
    ) {
      datas.push(...response.data.results.US.ads);
    }
    if (
      response.data.results &&
      response.data.results.US &&
      response.data.results.US.free
    ) {
      datas.push(...response.data.results.US.free);
    }

    return datas;
  } catch (error) {
    return undefined;
  }
};

const getMovieInfo = async (data) => {
  try {
    const response = await axios.get(
      `http://api.themoviedb.org/3/movie/${data}?api_key=${api}`
    );

    return response.data;
  } catch (error) {
    return undefined;
  }
};
const getCastAndCrew = async (data) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${data}/credits?api_key=${api}&language=en-US `
    );
    return response.data;
  } catch (error) {
    return undefined;
  }
};
const fetchAll = async () => {
  for (let i = 1000; i < 1500; i++) {
    console.log(i);
    const resp = await getMovieInfo(i);
    if (resp) {
      movies.push(resp);
    }
  }
  moviesJSON = JSON.stringify(movies);

  fs.writeFileSync("data_till_1500.json", moviesJSON, "utf-8");
};

const addCastAndCrewsToMovies = async () => {
  for (let i = 0; i < movies.length; i++) {
    console.log(i);
    const data = await getCastAndCrew(movies[i].id);
    // data.crew.map(({ job }) => console.log(job));

    if (data) {
      let crews = [];
      let cast = [];
      data.crew.forEach(({ name, job }) => {
        if (job === "Director" || job === "Screenplay") {
          crews.push({
            name,
            job,
          });
        }
      });

      if (data.cast) {
        let length = data.cast.length >= 5 ? 4 : data.cast.length;
        for (let i = 0; i < length; i++) {
          cast.push({
            name: data.cast[i].name,
            profile_path: data.cast[i].profile_path,
            character: data.cast[i].character,
            order: data.cast[i].order,
          });
        }
      }
      movies[i].cast = cast;
      movies[i].crew = crews;
    } else {
      movies[i].cast = [];
      movies[i].crew = [];
    }
  }
  moviesJSON = JSON.stringify(movies);

  fs.writeFileSync("crewData_till_1500.json", moviesJSON, "utf-8");
};

const addProvidersToMovies = async () => {
  for (let i = 0; i < movies.length; i++) {
    console.log(i);
    const data = await getProviders(movies[i].id);
    if (data) {
      movies[i].providers = data;
    } else {
      movies[i].providers = [];
    }
  }
  moviesJSON = JSON.stringify(movies);

  fs.writeFileSync("data_till_1500_withProviders.json", moviesJSON, "utf-8");
};

const cleanUpData = () => {
  for (let i = 0; i < movies.length; i++) {
    console.log(i);
    delete movies[i].belongs_to_collection;
    delete movies[i].budget;
    delete movies[i].homepage;
    delete movies[i].popularity;
    delete movies[i].production_countries;
    delete movies[i].video;
    delete movies[i].tagline;
    delete movies[i].vote_average;
    delete movies[i].vote_count;
    delete movies[i].original_title;
    delete movies[i].production_companies;
    movies[i].genres = movies[i].genres.map((genre) => {
      return genre.name;
    });

    movies[i].spoken_languages = movies[i].spoken_languages.map(
      (lang) => lang.english_name
    );
  }
  moviesJSON = JSON.stringify(movies);

  fs.writeFileSync("allData.json", moviesJSON, "utf-8");
};

const combineDatas = () => {
  let data1 = fs.readFileSync("./Datasets/1000/cleanedData_1000.json", "utf-8");
  let array1 = JSON.parse(data1);
  let data2 = fs.readFileSync("./Datasets/1500/cleanData_1500.json", "utf-8");
  let array2 = JSON.parse(data2);
  let data3 = fs.readFileSync("./Datasets/2000/cleanData_2000.json", "utf-8");
  let array3 = JSON.parse(data3);
  let combinedArray = [...array1, ...array2, ...array3];

  data1 = JSON.stringify(combinedArray);

  fs.writeFileSync("allData.json", data1, "utf-8");
};

const createThreeHalfs = () => {
  let data1 = fs.readFileSync("allData.json", "utf-8");
  let array1 = JSON.parse(data1);
  let first = [];
  let second = [];
  let third = [];
  const le = array1.length;
  for (let i = 0; i < le; i++) {
    if (i < le / 3) {
      first.push(array1[i]);
    } else if (i >= le / 3 && i < (2 * le) / 3) {
      second.push(array1[i]);
    } else {
      third.push(array1[i]);
    }
  }

  fs.writeFileSync(
    `firstHalf_${first.length}.json`,
    JSON.stringify(first),
    "utf-8"
  );
  fs.writeFileSync(
    `secondHalf_${second.length}.json`,
    JSON.stringify(second),
    "utf-8"
  );
  fs.writeFileSync(
    `thirdHalf_${third.length}.json`,
    JSON.stringify(third),
    "utf-8"
  );
};

const remove_any = () => {
  for (let i = 0; i < movies.length; i++) {
    console.log(i);
    delete movies[i].adult;
  }
  moviesJSON = JSON.stringify(movies);

  fs.writeFileSync("allData.json", moviesJSON, "utf-8");
};
const replaceNullBackdrop_with_PosterPic = () => {
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].backdrop_path === null) {
      movies[i].backdrop_path = movies[i].poster_path;
    }

    movies[i].cast = movies[i].cast.filter(
      (cast) => cast.profile_path !== null
    );
  }

  // movies = movies.filter(
  //   (movie) => movie.backdrop_path !== null && movie.poster_path !== null
  // );

  moviesJSON = JSON.stringify(movies);

  fs.writeFileSync("allData.json", moviesJSON, "utf-8");
};
const runScript = async () => {
  const MAINFILE = "data.json";
  const OTHERFILE = "data_with_other.json";
  const CLEANEDUPFILE = "cleaned_data.json";
};

// replaceNullBackdrop_with_PosterPic();
createThreeHalfs();
