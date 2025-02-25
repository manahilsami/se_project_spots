class Api {
  constructor(options) {
    // constructor body
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
        authorization: "64f06b7c-c06a-49c2-a52a-b300e02c0975",
      },
    }).then((res) => res.json());
  }

  // other methods for working with the API
}

export default Api;
