script.js

/* =========================================================
   BADDIELINK — OPTION A
   FRONTEND APPLICATION LOGIC
========================================================= */


/* =========================================================
   APPLICATION STATE
========================================================= */

const defaultState = {
  currentPage: "landing-page",
  currentView: "discover",

  onboardingStep: 1,

  profile: {
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    interests: [],
    photo: ""
  },

  wallet: {
    balance: 2500,

    transactions: [
      {
        title: "Welcome bonus",
        amount: 2500,
        type: "credit",
        date: "Today"
      }
    ]
  },

  currentChat: "Amaka",

  messages: {
    Amaka: [
      {
        text: "Hey! How are you?",
        type: "received",
        time: "10:40"
      },
      {
        text: "I'm good! Nice to meet you 😊",
        type: "sent",
        time: "10:41"
      },
      {
        text: "Nice to meet you too!",
        type: "received",
        time: "10:42"
      }
    ],

    Jay: [
      {
        text: "That sounds interesting!",
        type: "received",
        time: "09:18"
      }
    ],

    Tobi: [
      {
        text: "Send me the details.",
        type: "received",
        time: "Yesterday"
      }
    ]
  }
};


let state = loadState();


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


/* =========================================================
   STORAGE
========================================================= */

function loadState() {

  try {

    const saved = localStorage.getItem("baddielink_state");

    if (!saved) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultState),
      ...parsed,

      profile: {
        ...defaultState.profile,
        ...(parsed.profile || {})
      },

      wallet: {
        ...defaultState.wallet,
        ...(parsed.wallet || {})
      },

      messages: {
        ...defaultState.messages,
        ...(parsed.messages || {})
      }
    };

  } catch (error) {

    console.error(
      "Unable to load saved state:",
      error
    );

    return structuredClone(defaultState);
  }
}


function saveState() {

  try {

    localStorage.setItem(
      "baddielink_state",
      JSON.stringify(state)
    );

  } catch (error) {

    console.error(
      "Unable to save state:",
      error
    );
  }
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageId) {

  $$(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (!page) {
    return;
  }

  page.classList.add("active");

  state.currentPage = pageId;

  saveState();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function openApplication() {

  showPage("app-page");

  switchView(
    state.currentView || "discover"
  );

  renderWallet();
  renderProfile();
}


/* =========================================================
   VIEW NAVIGATION
========================================================= */

function switchView(viewName) {

  state.currentView = viewName;

  $$(".app-view").forEach(view => {
    view.classList.remove("active");
  });

  const selectedView =
    document.getElementById(
      `${viewName}-view`
    );

  if (selectedView) {
    selectedView.classList.add("active");
  }

  $$(".sidebar-item[data-view]").forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.view === viewName
    );

  });

  $$(".mobile-nav-item[data-view]").forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.view === viewName
    );

  });

  saveState();
}


/* =========================================================
   AGE VERIFICATION
========================================================= */

function continueFromAge() {

  const checkbox =
    $("#age-confirm");

  if (!checkbox.checked) {

    showToast(
      "Please confirm that you are 18 or above."
    );

    return;
  }

  showPage("register-page");
}


/* =========================================================
   ONBOARDING
========================================================= */

function updateOnboarding() {

  const step =
    state.onboardingStep;

  $$(".onboarding-step").forEach(item => {

    item.classList.toggle(
      "active",
      Number(item.dataset.step) === step
    );

  });

  const progress =
    $("#onboarding-progress");

  const stepLabel =
    $("#onboarding-step");

  if (progress) {

    progress.style.width =
      `${(step / 3) * 100}%`;
  }

  if (stepLabel) {

    stepLabel.textContent =
      `Step ${step} of 3`;
  }
}


function nextOnboarding() {

  if (
    state.onboardingStep === 1
  ) {

    const username =
      $("#profile-username").value.trim();

    if (!username) {

      showToast(
        "Please choose a username."
      );

      return;
    }

    state.profile.username =
      username;

    state.profile.bio =
      $("#profile-bio").value.trim();

  }


  if (
    state.onboardingStep === 2
  ) {

    if (
      state.profile.interests.length === 0
    ) {

      showToast(
        "Choose at least one interest."
      );

      return;
    }

  }


  if (state.onboardingStep < 3) {

    state.onboardingStep++;

    updateOnboarding();

    saveState();
  }
}


function previousOnboarding() {

  if (state.onboardingStep > 1) {

    state.onboardingStep--;

    updateOnboarding();
  }
}


function finishOnboarding() {

  state.profile.firstName =
    $("#first-name")?.value.trim() ||
    state.profile.firstName;

  state.profile.lastName =
    $("#last-name")?.value.trim() ||
    state.profile.lastName;

  state.profile.username =
    $("#profile-username")?.value.trim() ||
    state.profile.username;

  state.profile.bio =
    $("#profile-bio")?.value.trim() ||
    state.profile.bio;

  saveState();

  renderProfile();

  showToast(
    "Your profile is ready!"
  );

  setTimeout(() => {

    openApplication();

  }, 700);
}


/* =========================================================
   INTERESTS
========================================================= */

function toggleInterest(button) {

  const interest =
    button.dataset.interest;

  if (!interest) {
    return;
  }

  const index =
    state.profile.interests.indexOf(
      interest
    );

  if (index >= 0) {

    state.profile.interests.splice(
      index,
      1
    );

    button.classList.remove(
      "selected"
    );

  } else {

    state.profile.interests.push(
      interest
    );

    button.classList.add(
      "selected"
    );
  }

  saveState();
}


/* =========================================================
   PROFILE PHOTO
========================================================= */

function handleProfilePhoto(file) {

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {

    showToast(
      "Please choose an image file."
    );

    return;
  }

  const reader =
    new FileReader();

  reader.onload = event => {

    state.profile.photo =
      event.target.result;

    const preview =
      $("#photo-preview");

    if (preview) {

      preview.innerHTML = `
        <img
          src="${state.profile.photo}"
          alt="Profile preview"
        >
      `;
    }

    saveState();
  };

  reader.readAsDataURL(file);
}


/* =========================================================
   PROFILE RENDER
========================================================= */

function getInitials() {

  const first =
    state.profile.firstName?.charAt(0) || "";

  const last =
    state.profile.lastName?.charAt(0) || "";

  const initials =
    `${first}${last}`.trim();

  return initials || "U";
}


function renderProfile() {

  const name =
    `${state.profile.firstName} ${state.profile.lastName}`
      .trim() || "Your Name";

  const username =
    state.profile.username ||
    "@username";

  const bio =
    state.profile.bio ||
    "Welcome to my BaddieLink profile.";

  const initials =
    getInitials();


  const displayName =
    $("#profile-display-name");

  if (displayName) {
    displayName.textContent = name;
  }


  const displayUsername =
    $("#profile-display-username");

  if (displayUsername) {

    displayUsername.textContent =
      username.startsWith("@")
        ? username
        : `@${username}`;
  }


  const displayBio =
    $("#profile-display-bio");

  if (displayBio) {
    displayBio.textContent = bio;
  }


  const avatar =
    $("#profile-avatar");

  if (avatar) {

    if (state.profile.photo) {

      avatar.innerHTML = `
        <img
          src="${state.profile.photo}"
          alt="${name}"
        >
      `;

    } else {

      avatar.textContent =
        initials;
    }
  }


  const headerAvatar =
    $("#header-avatar");

  if (headerAvatar) {

    if (state.profile.photo) {

      headerAvatar.innerHTML = `
        <img
          src="${state.profile.photo}"
          alt="${name}"
        >
      `;

      headerAvatar.style.overflow =
        "hidden";

      headerAvatar.style.padding =
        "0";

      headerAvatar.style.background =
        "transparent";

    } else {

      headerAvatar.textContent =
        initials;
    }
  }


  const interestContainer =
    $("#profile-interests");

  if (interestContainer) {

    if (
      state.profile.interests.length
    ) {

      interestContainer.innerHTML =
        state.profile.interests
          .map(
            interest =>
              `<span>${escapeHtml(interest)}</span>`
          )
          .join("");

    } else {

      interestContainer.innerHTML =
        "<span>No interests added</span>";
    }
  }
}


/* =========================================================
   EDIT PROFILE
========================================================= */

function editProfile() {

  $("#profile-username").value =
    state.profile.username || "";

  $("#profile-bio").value =
    state.profile.bio || "";

  state.onboardingStep = 1;

  updateOnboarding();

  showPage("onboarding-page");

  showToast(
    "Update your profile details."
  );
}


/* =========================================================
   DISCOVER ACTIONS
========================================================= */

function likeProfile(button) {

  const card =
    button.closest(".discover-card");

  if (!card) {
    return;
  }

  button.classList.add("liked");

  showToast(
    "Profile liked ❤️"
  );
}


function passProfile(button) {

  const card =
    button.closest(".discover-card");

  if (!card) {
    return;
  }

  card.style.transition =
    "0.3s ease";

  card.style.opacity =
    "0";

  card.style.transform =
    "translateX(-30px)";

  setTimeout(() => {

    card.style.display =
      "none";

  }, 300);

  showToast(
    "Profile passed."
  );
}


/* =========================================================
   CHAT
========================================================= */

function openChat(name) {

  state.currentChat =
    name || "Amaka";

  switchView("messages");

  renderChat();

  $$(".conversation").forEach(
    conversation => {

      conversation.classList.toggle(
        "active",
        conversation.dataset.chatName ===
          state.currentChat
      );

    }
  );
}


function renderChat() {

  const name =
    state.currentChat;

  const nameElement =
    $("#chat-name");

  if (nameElement) {
    nameElement.textContent = name;
  }

  const messages =
    state.messages[name] || [];

  const container =
    $("#chat-messages");

  if (!container) {
    return;
  }

  container.innerHTML =
    messages
      .map(message => {

        return `
          <div class="message ${message.type}">
            <span>
              ${escapeHtml(message.text)}
            </span>

            <small>
              ${escapeHtml(message.time)}
            </small>
          </div>
        `;

      })
      .join("");

  container.scrollTop =
    container.scrollHeight;
}


function sendMessage(event) {

  event.preventDefault();

  const input =
    $("#chat-input");

  const text =
    input.value.trim();

  if (!text) {
    return;
  }

  const now =
    new Date();

  const time =
    now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  if (!state.messages[state.currentChat]) {

    state.messages[state.currentChat] =
      [];
  }


  state.messages[state.currentChat].push({

    text,

    type: "sent",

    time
  });


  input.value = "";

  saveState();

  renderChat();
}


/* =========================================================
   MESSAGE SEARCH
========================================================= */

function filterConversations() {

  const search =
    $("#message-search")
      .value
      .trim()
      .toLowerCase();

  $$(".conversation").forEach(
    conversation => {

      const name =
        conversation.dataset.chatName
          .toLowerCase();

      const text =
        conversation.textContent
          .toLowerCase();

      const matches =
        name.includes(search) ||
        text.includes(search);

      conversation.style.display =
        matches ? "flex" : "none";
    }
  );
}


/* =========================================================
   WALLET
========================================================= */

function formatNumber(number) {

  return Number(number)
    .toLocaleString("en-US");
}


function renderWallet() {

  const balance =
    formatNumber(
      state.wallet.balance
    );


  const walletBalance =
    $("#wallet-balance");

  if (walletBalance) {
    walletBalance.textContent =
      balance;
  }


  const giftBalance =
    $("#gift-balance");

  if (giftBalance) {
    giftBalance.textContent =
      balance;
  }


  const transactionList =
    $("#transactions-list");

  if (!transactionList) {
    return;
  }


  transactionList.innerHTML =
    state.wallet.transactions
      .slice()
      .reverse()
      .map(transaction => {

        const positive =
          transaction.type === "credit";

        return `
          <div class="transaction">

            <span
              class="transaction-icon
              ${positive ? "received" : ""}"
            >
              <i class="fa-solid ${
                positive
                  ? "fa-plus"
                  : "fa-minus"
              }"></i>
            </span>

            <div>

              <strong>
                ${escapeHtml(
                  transaction.title
                )}
              </strong>

              <span>
                ${escapeHtml(
                  transaction.date
                )}
              </span>

            </div>

            <b class="${
              positive
                ? "positive"
                : ""
            }">

              ${positive ? "+" : "-"}
              ${formatNumber(
                Math.abs(
                  transaction.amount
                )
              )}

            </b>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   SEND GIFT
========================================================= */

function sendGift(
  giftName,
  cost
) {

  cost =
    Number(
      String(cost).replace(/,/g, "")
    );


  if (
    !Number.isFinite(cost) ||
    cost <= 0
  ) {

    showToast(
      "Invalid gift."
    );

    return;
  }


  if (
    state.wallet.balance < cost
  ) {

    showToast(
      "You don't have enough coins."
    );

    return;
  }


  state.wallet.balance -= cost;


  state.wallet.transactions.push({

    title:
      `Sent ${giftName} to ${state.currentChat}`,

    amount: cost,

    type: "debit",

    date: "Just now"
  });


  saveState();

  renderWallet();

  closeModals();

  showToast(
    `${giftName} sent to ${state.currentChat} 🎁`
  );
}


/* =========================================================
   RECHARGE
========================================================= */

function rechargeWallet(
  coins,
  price
) {

  coins =
    Number(
      String(coins).replace(/,/g, "")
    );

  price =
    Number(
      String(price).replace(/,/g, "")
    );


  if (
    !Number.isFinite(coins) ||
    coins <= 0
  ) {

    return;
  }


  /*
    DEMO PAYMENT FLOW

    This does NOT process real money.

    In production, replace this section
    with a secure payment gateway such as
    Paystack / Flutterwave and confirm the
    payment from your backend.
  */


  state.wallet.balance += coins;


  state.wallet.transactions.push({

    title:
      `Recharge — ₦${formatNumber(price)}`,

    amount: coins,

    type: "credit",

    date: "Just now"
  });


  saveState();

  renderWallet();

  closeModals();

  showToast(
    `${formatNumber(coins)} coins added.`
  );
}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

  const modal =
    document.getElementById(id);

  if (!modal) {
    return;
  }

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";
}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (!modal) {
    return;
  }

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";
}


function closeModals() {

  $$(".modal-overlay").forEach(
    modal => {

      modal.classList.remove(
        "open"
      );

      modal.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  );

  document.body.style.overflow =
    "";
}


/* =========================================================
   FILTER
========================================================= */

function applyFilters() {

  closeModals();

  showToast(
    "Filters applied."
  );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function openNotifications() {

  openModal(
    "notification-modal"
  );
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function forgotPassword() {

  const email =
    $("#login-email").value.trim();

  if (!email) {

    showToast(
      "Enter your email first."
    );

    return;
  }

  showToast(
    `Password reset instructions sent to ${email}.`
  );
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function togglePassword(button) {

  const targetId =
    button.dataset.passwordTarget;

  const input =
    document.getElementById(
      targetId
    );

  if (!input) {
    return;
  }

  const icon =
    button.querySelector("i");

  if (input.type === "password") {

    input.type =
      "text";

    icon.className =
      "fa-regular fa-eye-slash";

  } else {

    input.type =
      "password";

    icon.className =
      "fa-regular fa-eye";
  }
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

  const toast =
    $("#toast");

  const text =
    $("#toast-message");

  if (!toast || !text) {
    return;
  }

  text.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3000);
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

  /*
    We intentionally preserve the local
    demo profile/wallet for testing.

    A production version should use
    proper server-side authentication.
  */

  showPage(
    "landing-page"
  );

  showToast(
    "You have been logged out."
  );
}


/* =========================================================
   REGISTER
========================================================= */

function handleRegister(event) {

  event.preventDefault();

  const firstName =
    $("#first-name")
      .value
      .trim();

  const lastName =
    $("#last-name")
      .value
      .trim();

  const email =
    $("#register-email")
      .value
      .trim();

  const password =
    $("#register-password")
      .value;


  if (
    password.length < 8
  ) {

    showToast(
      "Password must be at least 8 characters."
    );

    return;
  }


  state.profile.firstName =
    firstName;

  state.profile.lastName =
    lastName;


  /*
    Demo only.

    In production, NEVER store
    passwords in localStorage.
  */


  state.onboardingStep =
    1;

  saveState();


  showPage(
    "onboarding-page"
  );

  updateOnboarding();

  showToast(
    `Welcome to BaddieLink, ${firstName}!`
  );
}


/* =========================================================
   LOGIN
========================================================= */

function handleLogin(event) {

  event.preventDefault();

  const email =
    $("#login-email")
      .value
      .trim();

  if (!email) {
    return;
  }


  openApplication();

  showToast(
    "Welcome back!"
  );
}


/* =========================================================
   BIO CHARACTER COUNT
========================================================= */

function updateBioCounter() {

  const bio =
    $("#profile-bio");

  const counter =
    $(".character-count");

  if (!bio || !counter) {
    return;
  }

  counter.textContent =
    `${bio.value.length} / 160`;
}


/* =========================================================
   INITIALIZE PROFILE FORM
========================================================= */

function populateProfileForm() {

  const username =
    $("#profile-username");

  const bio =
    $("#profile-bio");

  if (username) {

    username.value =
      state.profile.username || "";
  }

  if (bio) {

    bio.value =
      state.profile.bio || "";

    updateBioCounter();
  }


  $$(".interest-chip").forEach(
    button => {

      if (
        state.profile.interests
          .includes(
            button.dataset.interest
          )
      ) {

        button.classList.add(
          "selected"
        );

      } else {

        button.classList.remove(
          "selected"
        );
      }
    }
  );
}


/* =========================================================
   GLOBAL EVENT DELEGATION
========================================================= */

document.addEventListener(
  "click",
  event => {

    const actionElement =
      event.target.closest(
        "[data-action]"
      );

    if (actionElement) {

      const action =
        actionElement.dataset.action;


      switch (action) {

        case "open-login":

          showPage(
            "login-page"
          );

          break;


        case "open-register":

          showPage(
            "age-page"
          );

          break;


        case "continue-age":

          continueFromAge();

          break;


        case "go-home":

          showPage(
            "landing-page"
          );

          break;


        case "next-onboarding":

          nextOnboarding();

          break;


        case "previous-onboarding":

          previousOnboarding();

          break;


        case "finish-onboarding":

          finishOnboarding();

          break;


        case "open-profile":

          switchView(
            "profile"
          );

          break;


        case "like-profile":

          likeProfile(
            actionElement
          );

          break;


        case "pass-profile":

          passProfile(
            actionElement
          );

          break;


        case "open-chat":

          openChat(
            actionElement.dataset.profile
          );

          break;


        case "open-gift-modal":

          openModal(
            "gift-modal"
          );

          break;


        case "open-recharge":

          openModal(
            "recharge-modal"
          );

          break;


        case "open-filters":

          openModal(
            "filter-modal"
          );

          break;


        case "apply-filters":

          applyFilters();

          break;


        case "open-notifications":

          openNotifications();

          break;


        case "close-modal":

          closeModals();

          break;


        case "forgot-password":

          forgotPassword();

          break;


        case "logout":

          logout();

          break;


        case "edit-profile":

          editProfile();

          break;

      }

    }


    /*
      Sidebar / mobile navigation
    */

    const viewElement =
      event.target.closest(
        "[data-view]"
      );

    if (
      viewElement &&
      viewElement.dataset.view
    ) {

      switchView(
        viewElement.dataset.view
      );
    }


    /*
      Interests
    */

    const interestButton =
      event.target.closest(
        ".interest-chip[data-interest]"
      );

    if (interestButton) {

      toggleInterest(
        interestButton
      );
    }


    /*
      Gift cards
    */

    const giftButton =
      event.target.closest(
        "[data-gift]"
      );

    if (
      giftButton &&
      !giftButton.matches(
        ".discover-card [data-gift]"
      )
    ) {

      const giftName =
        giftButton.dataset.gift;

      const cost =
        giftButton.dataset.cost;

      sendGift(
        giftName,
        cost
      );
    }


    /*
      Recharge packages
    */

    const coinPackage =
      event.target.closest(
        ".coin-package"
      );

    if (coinPackage) {

      rechargeWallet(
        coinPackage.dataset.coins,
        coinPackage.dataset.price
      );
    }


    /*
      Conversations
    */

    const conversation =
      event.target.closest(
        ".conversation"
      );

    if (conversation) {

      openChat(
        conversation.dataset.chatName
      );
    }


    /*
      Password toggles
    */

    const passwordButton =
      event.target.closest(
        ".password-toggle"
      );

    if (passwordButton) {

      togglePassword(
        passwordButton
      );
    }

  }
);


/* =========================================================
   FORM EVENTS
========================================================= */

$("#login-form")
  ?.addEventListener(
    "submit",
    handleLogin
  );


$("#register-form")
  ?.addEventListener(
    "submit",
    handleRegister
  );


$("#chat-form")
  ?.addEventListener(
    "submit",
    sendMessage
  );


/* =========================================================
   FILE UPLOAD
========================================================= */

$("#profile-photo")
  ?.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];

      handleProfilePhoto(file);
    }
  );


/* =========================================================
   BIO COUNTER
========================================================= */

$("#profile-bio")
  ?.addEventListener(
    "input",
    updateBioCounter
  );


/* =========================================================
   SEARCH
========================================================= */

$("#message-search")
  ?.addEventListener(
    "input",
    filterConversations
  );


/* =========================================================
   DISTANCE FILTER
========================================================= */

$("#distance-filter")
  ?.addEventListener(
    "input",
    event => {

      const value =
        event.target.value;

      $("#distance-value")
        .textContent =
        `${value} km`;
    }
  );


/* =========================================================
   ESC KEY — CLOSE MODALS
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closeModals();
    }
  }
);


/* =========================================================
   CLICK OUTSIDE MODAL
========================================================= */

$$(".modal-overlay").forEach(
  overlay => {

    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target === overlay
        ) {

          closeModals();
        }

      }
    );
  }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initialize() {

  /*
    Always start the demo on
    the landing page.

    This makes GitHub testing easier
    and prevents a refresh from
    unexpectedly opening the app.
  */

  showPage(
    "landing-page"
  );

  state.currentView =
    "discover";

  state.onboardingStep =
    1;

  updateOnboarding();

  populateProfileForm();

  renderProfile();

  renderWallet();

  renderChat();

}


initialize();
