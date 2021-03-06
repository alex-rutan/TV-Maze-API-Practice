"use strict";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const DEFAULT_IMAGE = "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
const TVMAZE_BASE_URL = "http://api.tvmaze.com";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(searchTerm) {
  let response = await axios.get(`${TVMAZE_BASE_URL}/search/shows`, {params: {q: searchTerm}});
  return response.data.map(function (showObj) {
    return {
        id: showObj.show.id,
        name: showObj.show.name,
        summary: showObj.show.summary,
        image: showObj.show.image !== null ? showObj.show.image.medium : DEFAULT_IMAGE 
    } 
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image}
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  // $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  let response = await axios.get(`${TVMAZE_BASE_URL}/shows/${id}/episodes`);
  return response.data.map(function (episode) {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number 
    }
  });
}


/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodesList.empty();
  $episodesArea.show();
  for (let episode of episodes) {
    const $episode = $(`<li> ${episode.name} (season ${episode.season} episode ${episode.number}) </li>`);
    $episodesList.append($episode);
    console.log("this is episode:", $episode);
  }
 }


$showsList.on("click", ".Show-getEpisodes", async function (evt) {
  let showId = $(evt.target.closest(".Show"));
  await displayEpisodes(showId.data("show-id"));
});


async function displayEpisodes(id) {
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}
