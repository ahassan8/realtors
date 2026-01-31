(() => {
  const EMAILJS_SERVICE_ID = "service_h7qiq8i";
  const EMAILJS_TEMPLATE_ID = "template_l1o0unm";
  const EMAILJS_PUBLIC_KEY = "aoGFP5Q0wIP69OaGx";

  const directoryKey = document.body.dataset.directory || "cars";
  const jsonPath = `data/${directoryKey}.json`;

  const el = (id) => document.getElementById(id);

  const headerTitle = el("headerTitle");
  const footerBrand = el("footerBrand");
  const footerNote = el("footerNote");
  const directoryDesc = el("directoryDesc");

  const businessList = el("businessList");

  const listTitle = el("listTitle");

  const listBusinessBtn = el("listBusinessBtn");

  const safe = (v) => (v ?? "").toString().trim();

  const makeImageBox = (src, alt, className) => {
    const clean = safe(src);
    if (!clean) {
      const div = document.createElement("div");
      div.className = className;
      return div;
    }
    const img = document.createElement("img");
    img.className = className;
    img.src = clean;
    img.alt = safe(alt);
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  };

  const addContactIf = (parent, label, value, href, className, targetBlank) => {
    const clean = safe(value);
    if (!clean) return;

    const a = document.createElement("a");
    a.className = className;
    a.href = href;
    a.textContent = `${label}: ${clean}`;
    if (targetBlank) a.target = "_blank";
    parent.appendChild(a);
  };

  const renderBusinesses = (items = []) => {
    if (!businessList) return;
    businessList.innerHTML = "";

    items.forEach((b) => {
      const card = document.createElement("article");
      card.className = "biz";

      const img = makeImageBox(b.image, b.name, "biz-img");

      const body = document.createElement("div");
      body.className = "biz-body";

      const title = document.createElement("div");
      title.className = "biz-title";
      title.textContent = safe(b.name);

      const addr = document.createElement("div");
      addr.className = "biz-addr";
      addr.textContent = safe(b.address || b.area || "");

      const contacts = document.createElement("div");
      contacts.className = "biz-contacts";

      addContactIf(
        contacts,
        "Phone",
        b.phone,
        `tel:${safe(b.phoneRaw || b.phone)}`,
        "contact biz-contact",
        false
      );

      addContactIf(
        contacts,
        "Email",
        b.email,
        `mailto:${safe(b.email)}`,
        "contact biz-contact",
        false
      );

      const websiteText = b.websiteLabel || b.website || "";
      addContactIf(
        contacts,
        "Website",
        websiteText,
        safe(b.website || ""),
        "contact biz-contact",
        true
      );

      body.appendChild(title);
      body.appendChild(addr);
      if (contacts.childElementCount) body.appendChild(contacts);

      card.appendChild(img);
      card.appendChild(body);

      businessList.appendChild(card);
    });
  };

  const applyText = (cfg) => {
    document.title = cfg.pageTitle || document.title;

    if (headerTitle) headerTitle.textContent = cfg.headerName || "Directory";
    if (listTitle) listTitle.textContent = cfg.listTitle || "Businesses";
    if (footerBrand) footerBrand.textContent = cfg.footerBrand || "Directory";
    if (footerNote) footerNote.textContent = cfg.footerNote || "";
    if (directoryDesc) directoryDesc.textContent = cfg.directoryDescription || "";
  };

  const initDirectory = async () => {
    try {
      const res = await fetch(jsonPath, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
      const cfg = await res.json();

      applyText(cfg);

      const merged = []
        .concat(Array.isArray(cfg.recommended) ? cfg.recommended : [])
        .concat(Array.isArray(cfg.businesses) ? cfg.businesses : []);

      renderBusinesses(merged);
    } catch (err) {
      console.error(err);
      if (headerTitle) headerTitle.textContent = "Directory";
    }
  };

  const ensureEmailJS = () => {
    if (!window.emailjs) return false;
    if (!ensureEmailJS.inited) {
      window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      ensureEmailJS.inited = true;
    }
    return true;
  };

  const setSendingPopup = (on, msg) => {
    const overlay = el("hnModalOverlay");
    if (!overlay) return;

    let pop = el("hnSendingPopup");
    if (!pop) {
      pop = document.createElement("div");
      pop.id = "hnSendingPopup";
      pop.className = "hn-sending";
      pop.innerHTML = `
        <div class="hn-sending-card" role="status" aria-live="polite">
          <div class="hn-sending-spinner" aria-hidden="true"></div>
          <div class="hn-sending-text" id="hnSendingText">Sending...</div>
        </div>
      `;
      overlay.appendChild(pop);
    }

    const txt = el("hnSendingText");
    if (txt) txt.textContent = msg || "Sending...";
    pop.style.display = on ? "flex" : "none";
  };

  const buildModal = () => {
    if (el("hnModalOverlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "hnModalOverlay";
    overlay.className = "hn-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const modal = document.createElement("div");
    modal.className = "hn-modal";

    const top = document.createElement("div");
    top.className = "hn-modal-top";

    const title = document.createElement("div");
    title.className = "hn-modal-title";
    title.textContent = "Contact Hassan Network";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "hn-modal-close";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close");

    top.appendChild(title);
    top.appendChild(close);

    const form = document.createElement("form");
    form.className = "hn-form";
    form.id = "hnListForm";

    const makeField = (labelText, id, type, placeholder) => {
      const wrap = document.createElement("div");
      wrap.className = "hn-field";

      const label = document.createElement("label");
      label.className = "hn-label";
      label.setAttribute("for", id);
      label.textContent = labelText;

      const input =
        type === "textarea" ? document.createElement("textarea") : document.createElement("input");

      input.className = "hn-input";
      input.id = id;
      input.name = id;
      input.placeholder = placeholder || "";
      if (type !== "textarea") input.type = type;
      if (type === "textarea") input.rows = 4;

      wrap.appendChild(label);
      wrap.appendChild(input);
      return wrap;
    };

    form.appendChild(makeField("Name", "hn_name", "text", "Full Name"));
    form.appendChild(makeField("Email", "hn_email", "email", "you@example.com"));
    form.appendChild(makeField("Phone", "hn_phone", "tel", "Phone Number"));
    form.appendChild(makeField("Message", "hn_description", "textarea", "Type Message..."));

    const actions = document.createElement("div");
    actions.className = "hn-actions";

    const status = document.createElement("div");
    status.className = "hn-status";
    status.id = "hnStatus";
    status.textContent = "";

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn btn-primary hn-submit";
    submit.textContent = "Submit";

    actions.appendChild(status);
    actions.appendChild(submit);

    const consent = document.createElement("div");
    consent.className = "hn-consent";
    consent.textContent =
      "By submitting, you agree to receive email and/or text messages about your request. Message and data rates may apply. Reply STOP to opt out.";

    form.appendChild(actions);
    form.appendChild(consent);

    modal.appendChild(top);
    modal.appendChild(form);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeModal = () => {
      setSendingPopup(false);
      overlay.classList.remove("is-open");
      document.body.classList.remove("hn-modal-open");
      status.textContent = "";
      form.reset();
    };

    close.addEventListener("click", closeModal);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (overlay.classList.contains("is-open") && e.key === "Escape") closeModal();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const ok = ensureEmailJS();
      if (!ok) {
        status.textContent = "Email service not loaded yet.";
        return;
      }

      const payload = {
        directory: directoryKey,
        page_title: safe(document.title),
        header_name: safe(headerTitle?.textContent),
        name: safe(el("hn_name")?.value),
        email: safe(el("hn_email")?.value),
        phone: safe(el("hn_phone")?.value),
        description: safe(el("hn_description")?.value)
      };

      if (!payload.name || (!payload.email && !payload.phone)) {
        status.textContent = "Please add your name and at least an email or phone.";
        return;
      }

      submit.disabled = true;
      status.textContent = "";
      setSendingPopup(true, "Sending...");

      try {
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
        setSendingPopup(true, "Sent!");
        setTimeout(() => {
          submit.disabled = false;
          setSendingPopup(false);
          overlay.classList.remove("is-open");
          document.body.classList.remove("hn-modal-open");
          status.textContent = "";
          form.reset();
        }, 850);
      } catch (err) {
        console.error(err);
        setSendingPopup(false);
        status.textContent = "Could not send. Please try again.";
        submit.disabled = false;
      }
    });
  };

  const openModal = () => {
    buildModal();
    const overlay = el("hnModalOverlay");
    overlay.classList.add("is-open");
    document.body.classList.add("hn-modal-open");
    setSendingPopup(false);
    setTimeout(() => {
      const nameInput = el("hn_name");
      if (nameInput) nameInput.focus();
    }, 50);
  };

  const initListBusiness = () => {
    if (!listBusinessBtn) return;
    listBusinessBtn.addEventListener("click", openModal);
  };

  initDirectory();
  initListBusiness();
})();












