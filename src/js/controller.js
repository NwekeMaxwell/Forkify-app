import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './module';
import recipeView from './views/recipeView';
import searchView from '../js/views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import { MODAL_CLOSE_SEC } from './config';

// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {
    //create id for haShchange event
    const id = window.location.hash.slice(1);
    if (!id) return;

    //render spinner
    recipeView.renderSpinner();

    //0 update results view to highlight selected
    resultsView.update(model.getSearchResultsPage());
    //update bookmarks
    bookmarksView.update(model.state.bookmarks);

    //1) loading recipe
    await model.loadRecipe(id);

    //2) rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();

    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;
    // 2) load search results
    await model.loadSearchResults(query);
    // 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());
    //4) render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // render new result
  resultsView.render(model.getSearchResultsPage(goToPage));
  // render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update recipe serving (in state)
  model.updateServings(newServings);
  //update recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add / remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    //show loading spinner
    addRecipeView.renderSpinner();
    //upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //render recipe
    recipeView.render(model.state.recipe);
    //success message
    addRecipeView.renderMessage();
    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
    //render bookmarks view
    bookmarksView.render(model.state.bookmarks);
    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (err) {
    console.error('%%%%', err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  addRecipeView.addHandlerUpload(controlAddRecipe);
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks()
