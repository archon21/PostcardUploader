import axios from "axios";
import { makeAutoObservable, toJS } from "mobx";
import { siteConfig } from "../../site-config";
import Util from "../util";

export interface Request {
  type: "GET" | "POST" | "PATCH" | "DELETE" | string;
}

const noAction = {
  type: "",
};

const defaultStateHandler = ({
  action,
  currentDefaultState,
}: {
  action: Request;
  currentDefaultState: any;
}) => {
  return currentDefaultState;
};

class Store {
  defaultState = {
    content: {
      home: {
        uploadedCards: [],
      },
    },
    mode: "view",
  };
  action: Request = noAction;
  window = {
    scrollY: 0,
    lastScrollY: 0,
    clientWidth: global?.window?.innerWidth || 0,
  };
  user: { roles: [string]; mode: "view" | "edit"; token: string } = {
    roles: [""],
    mode: "edit",
    token: "",
  };
  content = {};

  constructor() {
    makeAutoObservable(this);
  }

  async defaultStateHandler({ defaultState }) {
    if (Array.isArray(defaultState?.menus)) {
      const menus = {};
      defaultState.menus.forEach((menu) => (menus[menu.name] = menu));
      defaultState.menus = menus;
    }
    this.defaultState = defaultStateHandler({
      action: this.action,
      currentDefaultState: { ...this.defaultState, ...defaultState },
    });

    this.action = { type: "" };
  }

  async defaultStateGetter({ htmlRouteAccess }) {
    const htmlRoute = siteConfig.server.htmlRoutes.find(
      (route) => route.component === htmlRouteAccess
    );

    const newDefaultState = {};
    for (let i = 0; i < htmlRoute.methods.length; i++) {
      let services = htmlRoute.methods[i].services;

      for (let j = 0; j < services.length; j++) {
        let service = services[j];
        let { data } = await Util.Request({
          url: `/api/${service.accessorName.toLowerCase()}`,
          method: "GET",
        });
        

        newDefaultState[service.stateName] = data;
      }
    }
    await this.defaultStateHandler({ defaultState: newDefaultState });
  }

  async defaultMenuHandler({ menu }) {
    if (menu._id) {
      const res = await Util.Request({
        method: "PATCH",
        url: "/api/menu",
        data: { menus: [menu] },
      });
      this.defaultStateGetter({ htmlRouteAccess: "Home" });
    }
  }

  async defaultUserHandler({ email, password, history }) {
    try {
      const userResponseData = await Util.API.User.login({ email, password });

      if (userResponseData?.data.mode) {
        await this.defaultStateHandler({ defaultState: { mode: "edit" } });

        history.push("/");
      }
    } catch (err) {
      alert(err);
    }
  }

  defaultScrollHandler({ scrollY, lastScrollY }) {
    this.window = { ...this.window, lastScrollY: lastScrollY, scrollY };
  }

  async defaultContentHandler({ content, action, accessor, page }) {
    try {
      if (action === "GET") {
      } else if (action === "SET") {
        await Util.Request({
          method: "POST",
          url: "/api/content",
          data: { items: content, page, accessor },
        });
        this.content = content;
      } else if (action === "INITIAL") {
        this.content = content.content;
      }
    } catch (err) {
      console.error(err);
    }
  }
  async cardUploader({ images }) {
    try {
      const formData = new FormData();
      images.forEach((data) => {
        if (data instanceof FileList) {
          formData.append(data.name, data, data.name);
        } else {
          formData.append(data.name, data);
        }
      });
      images.forEach((file) => {
        formData.append("file", file.name);
      });
      // formData.append("files", images);
      await axios.post("/api/storage", formData);
      // await Util.Request({
      //   method: "POST",
      //   url: "/api/storage",
      //   files: images ,
      // });
    } catch (err) {
      console.error(err);
    }
  }
}

const store = new Store();

export default store;
