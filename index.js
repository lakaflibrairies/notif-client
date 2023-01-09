/**
 * @param {{
 *   clientType: "website" | "web-app" | "mobile-app" | "desktop-app" | "client-test" | "unknown-client";
 *   eventPath: string;
 * }} options
 */
function NotificationClient(host = location.origin, options) {
  const {
    clientType = "unknown-client",
    eventPath = "notifications",
    time = 5,
  } = options || {};
  const validateHost = (value) => {
    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  };
  if (typeof host !== "string" || !validateHost(host)) {
    throw new Error("Invalid host.");
  }

  if (typeof eventPath !== "string" || eventPath.length === 0) {
    throw new Error("Invalid event path.");
  }

  const allowedClients = [
    "website",
    "web-app",
    "mobile-app",
    "desktop-app",
    "client-test",
    "unknown-client",
  ];
  if (!allowedClients.includes(clientType)) {
    throw new Error("Invalid client type.");
  }

  const clientId = "default";
  const messageHead = "alive";
  const b = {
    credentials: {
      empty: true,
    },
    endpoint: "",
    head: {},
    payload: {},
    reserved: {
      clientId,
      clientType,
      messageHead,
    },
  };
  const url = `${host}/${eventPath}/notify-me`;
  const listeners = {};
  const timer = null;

  const api = ({ body }) => {
    return new Promise((resolve, reject) => {
      fetch(url, {
        body,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(({ error, result }) => {
          if (error) {
            reject(error.code + ": " + error.message);
            return;
          }
          resolve(result);
        });
    });
  };

  const computeUrl = () =>
    `${url}?client=${b.reserved.clientId}&messageHead=${messageHead}`;

  const createEventSource = () => {
    return new EventSource(computeUrl());
  };

  const send = (eventName, config = {}) => {
    const { body = {}, headers = {} } = config;
    let newB = JSON.parse(JSON.stringify(b));
    newB.endpoint = eventName;
    newB.payload = body;
    newB.head = headers;

    return api({ body: JSON.stringify(newB) }).catch((error) => {
      console.log("An error occur.");
      console.error(error);
    });
  };

  const receive = (_es, eventName, eventCallback) => {
    if (typeof eventCallback === "function") {
      _es.addEventListener(eventName, eventCallback);
    }
  };

  let es = createEventSource();

  const startHiTimer = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      send("hi").catch((error) => {
        console.log("Unable to hi server.");
        console.error(error);
      });
      startHiTimer();
    }, time * 1000);
  };

  const onResetConnection = (data) => {
    es.close();
    b.reserved.clientId = JSON.parse(data).clientId;
    es = createEventSource();
    loadEventSource();
  };

  const onReconnection = (data) => {
    es.close();
    b.reserved.clientId = JSON.parse(data).clientId;
    let newB = JSON.parse(JSON.stringify(b));

    newB.endpoint = "reconnection-required";
    newB.payload.clientId = b.reserved.clientId;
    newB.payload.clientType = b.reserved.clientType;

    api({ body: JSON.stringify(newB) })
      .then(({ result }) => {
        es = createEventSource();
        loadEventSource();
        listeners["ready"]({
          send,
          receive: (eventName, eventCallback) =>
            receive(es, eventName, eventCallback),
        });
        startHiTimer();
      })
      .catch((error) => {
        console.log("An error occur.");
      });
  };

  function loadEventSource() {
    es.addEventListener("reset-connection-required", ({ data }) =>
      onResetConnection(data)
    );
    es.addEventListener("reconnection-required", ({ data }) =>
      onReconnection(data)
    );
  }

  loadEventSource();

  Object.defineProperty(this, "addEventListener", {
    writable: false,
    value: (event, cb) => {
      if (typeof cb !== "function") {
        throw new Error("Expected a function but got " + typeof cb + ".");
      }
      listeners[event] = cb;
    },
  });
}

exports.NotificationClient = NotificationClient;
