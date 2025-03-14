import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "64f06b7c-c06a-49c2-a52a-b300e02c0975",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.prepend(cardElement);
    });
    profileAvatar.src = userInfo.avatar;
    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;
  })
  .catch(console.error);

const profileAvatar = document.querySelector(".profile__avatar");
const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn_del");
const deleteModalCancelButton = deleteModal.querySelector(
  ".modal__submit-btn_cancel"
);

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function handleLike(evt, cardLikeBtn, id) {
  const isLiked = cardLikeBtn.classList.contains("card__like-btn_liked");
  api
    .changeLikeStatus(id, isLiked)
    .then((updatedCard) => {
      cardLikeBtn.classList.toggle("card__like-btn_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const deleteButton = cardElement.querySelector(".card__del-btn");

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  cardLikeBtn.addEventListener("click", (evt) =>
    handleLike(evt, cardLikeBtn, data._id)
  );
  deleteButton.addEventListener("click", (evt) =>
    handleDeleteCard(cardElement, data._id)
  );
  return cardElement;
}

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscapeKey);
}

function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openModal = document.querySelector(".modal_opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", handleOverlayClick);
});

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      // Use data argument instead of input values
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      // TODO -  call setButtonText instead
      setButtonText(submitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  api
    .addNewCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardsList.prepend(cardElement);
      evt.target.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove(); // remove card from DOM
      closeModal(deleteModal); // close the modal
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete");
    });
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);

  const avatarUrl = avatarInput.value;
  api
    .editAvatarInfo(avatarUrl)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings, [
    editModalNameInput,
    editModalDescriptionInput,
  ]);
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});
cardForm.addEventListener("submit", handleAddCardSubmit);

avatarModalBtn.addEventListener("click", () => {
  avatarInput.value = profileAvatar.src;
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModalCancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

enableValidation(settings);
