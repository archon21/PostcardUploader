import React, { Component, Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import { useLocalStore, observer } from "mobx-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v1 as uuidv1 } from "uuid";

import _ from "lodash";

import { Content, Layout, Typography, Inputs } from "../../";
import { siteConfig, Styles } from "../../../../site-config";
import store from "../../../store";
import { toJS } from "mobx";
import { Buttons } from "../../element-components";

const v1options = {
  node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
  clockseq: 0x1234,
  msecs: new Date("2011-11-01").getTime(),
  nsecs: 5678,
};

const _getPriceDisplay = ({ price, priceIndex }) => {
  try {
    let ret = [""];

    if (!Array.isArray(price)) return ret;
    else {
      return price
        ?.reduce((acc, curr) => {
          if (curr.priceType === "amount")
            acc.push(Math.round(curr.amount / 100));
          else if (curr.priceType === "market-price") acc.push("MP");
          else return "";
          return acc;
        }, [])
        ?.join(" / ");
    }
  } catch (err) {
    return "";
  }
};

const genRanHex = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

const defaultPrice = () => ({
  _id: genRanHex(24),
  amount: 0,
  priceType: "amount",
});

const defaultOption = () => ({
  _id: genRanHex(24),
  name: "",
  unit: "",
  price: [defaultPrice()],
});

const defaultItem = () => ({
  _id: genRanHex(24),
  name: "",
  description: "",
  add: [],
  options: [],
  unit: "",
  price: [defaultPrice()],
});

const defaultSection = () => ({
  _id: genRanHex(24),
  name: "",
  description: "",
  items: [defaultItem()],
});

const Vessel = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  flex-direction: column;
  box-shadow: ${Styles.Colors.boxShadow};
  padding: 1.5em 0;

  justify-content: center;
  max-width: 30em;
  border-radius: 3px;
`;

const MenuDisplayItem = styled.div<{ appMode: string }>`
  display: grid;
  grid-template-columns: 80% 20%;

  width: 100%;
  z-index: 1;
  // border-top: ${(props) =>
    props.appMode === "edit" ? `2px dashed #999` : "none"};
`;

const MenuDisplaySection = styled.div<{ appMode: string; collapsed: boolean }>`
  width: 100%;
  border-bottom: ${(props) =>
    props.appMode === "edit" && !props.collapsed ? `2px solid #333` : "none"};
  margin: 0 0 0.5em 0;
  display: flex;
  flex-direction: column;
`;

const MenuDisplayOption = styled.div`
  display: grid;
  grid-template-columns: 80% 20%;
  width: 100%;
`;

interface ArgumentsHandleEditMenu {
  action: "ADD" | "DELETE";
  accessString: string;
  internalIndex: number;
  value?: any;
  defaultItem?: any;
}

interface ArgumentsMenuPrice {
  amount: number;
  type: "market-price" | "amount";
}

interface ArgumentsMenuOptions {
  _id: string;
  name: string;
  price: ArgumentsMenuPrice[];
  type: "add" | "option";
}

interface ArgumentsMenuItems {
  _id: string;
  name: string;
  description: string;
  price: ArgumentsMenuPrice[];
  options: ArgumentsMenuOptions[];
}

interface ArgumentsMenuSection {
  name: string;
  _id: string;
  description: string;
  items: ArgumentsMenuItems[];
}

interface ArgumentsMenu {
  _id?: string;
  name: string;
  sections: ArgumentsMenuSection[];
}

interface PropsGeneric {
  type: "section" | "item" | "option";
  menuToUpdate: ArgumentsMenu;
  menuDisplayConfig: { mounted: boolean; menu: ArgumentsMenu };
  ids?: {
    section?: {
      id: string;
      index: number;
    };
    item?: {
      id: string;
      index: number;
    };
    option?: {
      id: string;
      index: number;
    };
  };

  setMenuDisplayConfig: any;
  setMenuToUpdate: any;
  handleMenuChange: any;
  handleEditMenu: any;
}

interface PropsMenuDisplayLoopWrapper extends PropsGeneric {
  items: ArgumentsMenuItems[] | ArgumentsMenuOptions[] | ArgumentsMenuSection[];
}

class MenuDisplayLoopWrapper extends Component<PropsMenuDisplayLoopWrapper> {
  onDragEnd = (droppedItem) => {
    const {
      menuDisplayConfig,
      setMenuToUpdate,
      menuToUpdate,
      setMenuDisplayConfig,
      ids,
    } = this.props;
    if (droppedItem.type === "section") {
      if (!droppedItem.destination) return;
      if (droppedItem?.destination?.droppableId === `item-list-container`)
        return;
      var updatedList = [...menuToUpdate.sections];
      // Remove dragged item
      const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
      // Add dropped item
      updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
      // Update State
      const updatedMenu = {
        ...menuToUpdate,
        sections: updatedList,
      };

      setMenuDisplayConfig({
        ...menuDisplayConfig,
        menu: updatedMenu,
      });
      setMenuToUpdate(updatedMenu);
    } else if (droppedItem.type === "item") {
      if (!droppedItem.destination) return;
      var updatedList = [...menuToUpdate.sections[ids?.section?.index].items];
      // Remove dragged item
      const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
      // Add dropped item
      updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
      // Update State
      const updatedMenu = {
        ...menuToUpdate,
        sections: menuToUpdate.sections.map((section, currIndex) => {
          if (ids?.section?.index === currIndex)
            return { ...section, items: updatedList };
          else return section;
        }),
      };

      setMenuDisplayConfig({
        ...menuDisplayConfig,
        menu: updatedMenu,
      });
      setMenuToUpdate(updatedMenu);
    } else if (droppedItem.type === "option") {
      if (!droppedItem.destination) return;
      var updatedList = [
        ...menuToUpdate.sections[ids?.section?.index].items[ids?.item?.index]
          .options,
      ];
      // Remove dragged item
      const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
      // Add dropped item
      updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
      // Update State
      const updatedMenu = {
        ...menuToUpdate,
        sections: menuToUpdate.sections.map((section, currIndex) => {
          if (ids?.section?.index === currIndex)
            return { ...section, items: updatedList };
          else return section;
        }),
      };

      setMenuDisplayConfig({
        ...menuDisplayConfig,
        menu: updatedMenu,
      });
      setMenuToUpdate(updatedMenu);
    }
  };

  render() {
    const {
      menuDisplayConfig,
      setMenuToUpdate,
      menuToUpdate,
      setMenuDisplayConfig,
      type,
      items,
      ids,
      handleMenuChange,
      handleEditMenu,
    } = this.props;
    const { mode } = store.defaultState;
    return mode === "edit" ? (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId={`${type}-list-container`} type={type}>
          {(provided) => (
            <div
              className={`${type}-list-container`}
              style={{ width: type === "section" ? "90%" : "100%" }}
              {...provided.droppableProps}
              ref={provided.innerRef}>
              {items?.map((internalItem, internalIndex) => {
                const { _id: internalId } = internalItem;

                return (
                  <Draggable
                    key={internalId}
                    draggableId={internalId}
                    index={internalIndex}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`type-container`}>
                        {type === "section" ? (
                          <MenuSection
                            ids={{
                              ...ids,
                              section: { id: internalId, index: internalIndex },
                            }}
                            type="section"
                            menuToUpdate={menuToUpdate}
                            menuDisplayConfig={menuDisplayConfig}
                            setMenuDisplayConfig={setMenuDisplayConfig}
                            setMenuToUpdate={setMenuToUpdate}
                            handleMenuChange={handleMenuChange}
                            handleEditMenu={handleEditMenu}
                            section={internalItem}
                            provided={provided}></MenuSection>
                        ) : type === "item" ? (
                          <MenuItem
                            ids={{
                              ...ids,
                              item: { id: internalId, index: internalIndex },
                            }}
                            type="section"
                            menuToUpdate={menuToUpdate}
                            menuDisplayConfig={menuDisplayConfig}
                            setMenuDisplayConfig={setMenuDisplayConfig}
                            setMenuToUpdate={setMenuToUpdate}
                            handleMenuChange={handleMenuChange}
                            handleEditMenu={handleEditMenu}
                            item={internalItem}
                            provided={provided}></MenuItem>
                        ) : (
                          <MenuOption
                            ids={{
                              ...ids,
                              option: { id: internalId, index: internalIndex },
                            }}
                            type="section"
                            menuToUpdate={menuToUpdate}
                            menuDisplayConfig={menuDisplayConfig}
                            setMenuDisplayConfig={setMenuDisplayConfig}
                            setMenuToUpdate={setMenuToUpdate}
                            handleMenuChange={handleMenuChange}
                            handleEditMenu={handleEditMenu}
                            option={internalItem}
                            provided={provided}></MenuOption>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    ) : (
      items.map((internalItem, internalIndex) => {
        const { _id: internalId } = internalItem;
        return (
          <Layout.Flex
            width={type === "item" ? "90%" : "100%"}
            style={{ alignSelf: "center" }}
            column
            xAlign="center">
            {type === "section" ? (
              <MenuSection
                ids={{
                  ...ids,
                  section: { id: internalId, index: internalIndex },
                }}
                type="section"
                menuToUpdate={menuToUpdate}
                menuDisplayConfig={menuDisplayConfig}
                setMenuDisplayConfig={setMenuDisplayConfig}
                setMenuToUpdate={setMenuToUpdate}
                handleMenuChange={handleMenuChange}
                handleEditMenu={handleEditMenu}
                section={internalItem}></MenuSection>
            ) : type === "item" ? (
              <MenuItem
                ids={{ ...ids, item: { id: internalId, index: internalIndex } }}
                type="section"
                menuToUpdate={menuToUpdate}
                menuDisplayConfig={menuDisplayConfig}
                setMenuDisplayConfig={setMenuDisplayConfig}
                setMenuToUpdate={setMenuToUpdate}
                handleMenuChange={handleMenuChange}
                handleEditMenu={handleEditMenu}
                item={internalItem}></MenuItem>
            ) : (
              <MenuOption
                ids={{
                  ...ids,
                  option: { id: internalId, index: internalIndex },
                }}
                type="section"
                menuToUpdate={menuToUpdate}
                menuDisplayConfig={menuDisplayConfig}
                setMenuDisplayConfig={setMenuDisplayConfig}
                setMenuToUpdate={setMenuToUpdate}
                handleMenuChange={handleMenuChange}
                handleEditMenu={handleEditMenu}
                option={internalItem}></MenuOption>
            )}
          </Layout.Flex>
        );
      })
    );
  }
}

interface PropsMenuSection extends PropsGeneric {
  section: ArgumentsMenuSection;
  provided?: any;
}

const MenuSection: React.FC<PropsMenuSection> = (props) => {
  const {
    ids,
    menuToUpdate,
    menuDisplayConfig,
    handleMenuChange,
    setMenuDisplayConfig,
    setMenuToUpdate,
    handleEditMenu,
    provided,
    section,
  } = props;
  const { name, description, items } = section;
  const { mode } = store.defaultState;

  const [collapsed, setCollapsed] = useState(mode === "edit");

  return (
    <MenuDisplaySection collapsed={collapsed} appMode={mode}>
      {mode === "edit" && (
        <Layout.Grid
          margin=".8em 0 .3em"
          layout={collapsed ? [15, 15, 35, 35] : [33, 33, 33]}>
          {collapsed ? (
            <Buttons.Icon
              onClick={() => setCollapsed(false)}
              iconConfig={{ name: "keyboard_arrow_down", type: "icon" }}
              color="primary"
            />
          ) : (
            <Buttons.Icon
              onClick={() => setCollapsed(true)}
              iconConfig={{ name: "keyboard_arrow_up", type: "icon" }}
              color="primary"
            />
          )}
          {collapsed && (
            <Content.Icon
              {...provided.dragHandleProps}
              padding=".25em"
              type="icon"
              color="primary"
              name="pan_tool"></Content.Icon>
          )}
          <Buttons.Button
            margin=".25em 0 0"
            color="white"
            variant="h5"
            background="safe"
            style={{ justifySelf: "flex-end" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditMenu({
                accessString: `sections.${ids?.section?.index}.items`,
                action: "ADD",
                value: defaultItem(),
                internalIndex: 0,
              });
            }}>
            ADD ITEM
          </Buttons.Button>
          <Buttons.Button
            margin=".25em 0 0"
            color="white"
            variant="h5"
            background="danger"
            style={{ justifySelf: "flex-end" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditMenu({
                accessString: `sections`,
                action: "DELETE",
                value: {},
                internalIndex: ids?.section?.index,
              });
            }}>
            DELETE SECTION
          </Buttons.Button>
        </Layout.Grid>
      )}
      {mode === "edit" ? (
        <Inputs.Field
          key={`sections.${ids?.section?.index}.name`}
          fieldType="text"
          placeholder="Section Name"
          defaultValue={name}
          onChange={(e) => {
            e.preventDefault();
            handleMenuChange({
              value: e.target.value,
              accessString: `sections.${ids?.section?.index}.name`,
            });
          }}></Inputs.Field>
      ) : (
        <Typography.Typography
          margin="0 0 1em"
          textAlign="left"
          color="textTertiary"
          fontFamily="secondary"
          variant="h4">
          {name}
        </Typography.Typography>
      )}
      {mode === "edit" ? (
        <Inputs.Field
          key={`sections.${ids?.section?.index}.description`}
          fieldType="text"
          placeholder="Section Description"
          defaultValue={description}
          onChange={(e) => {
            e.preventDefault();
            handleMenuChange({
              value: e.target.value,
              accessString: `sections.${ids?.section?.index}.description`,
            });
          }}></Inputs.Field>
      ) : (
        description && (
          <Layout.Flex margin="0 0 1em" column>
            <Typography.Typography
              margin="0 0 .2em"
              textAlign="left"
              color="textTertiary"
              variant="p">
              {description}
            </Typography.Typography>
          </Layout.Flex>
        )
      )}

      {!collapsed && (
        <MenuDisplayLoopWrapper
          items={section.items}
          ids={ids}
          type="item"
          menuToUpdate={menuToUpdate}
          menuDisplayConfig={menuDisplayConfig}
          setMenuDisplayConfig={setMenuDisplayConfig}
          setMenuToUpdate={setMenuToUpdate}
          handleMenuChange={handleMenuChange}
          handleEditMenu={handleEditMenu}></MenuDisplayLoopWrapper>
      )}
    </MenuDisplaySection>
  );
};

interface PropsMenuItem extends PropsGeneric {
  item: ArgumentsMenuItems;
  provided?: any;
}

const MenuItem: React.FC<PropsMenuItem> = (props) => {
  const { mode, user } = store.defaultState;
  const {
    handleMenuChange,
    item,
    menuToUpdate,
    menuDisplayConfig,
    setMenuToUpdate,
    setMenuDisplayConfig,
    handleEditMenu,
    ids,
    provided,
  } = props;
  const { name, description, price, unit } = item;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    setTimeout(() => setMounted(true), 100);
  }, [
    menuToUpdate.sections[ids?.section?.index].items[ids?.item?.index].price
      .length,
  ]);

  return mounted ? (
    <Layout.Flex padding="0 0 0.5em 0" margin="0 0 0.75em 0" column>
      {mode === "edit" && (
        <Layout.Grid padding=".8em 0 .3em" layout={[33, 33, 33]}>
          <Content.Icon
            {...provided.dragHandleProps}
            padding=".25em"
            type="icon"
            color="primary"
            name="pan_tool"></Content.Icon>
          <Buttons.Button
            margin=".25em 0 0"
            color="white"
            variant="h5"
            background="safe"
            style={{ justifySelf: "flex-end" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditMenu({
                action: "ADD",
                value: defaultOption(),
                accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.options`,
                internalIndex: 0,
              });
            }}>
            ADD OPTION
          </Buttons.Button>
          <Buttons.Button
            margin=".25em 0 0"
            color="white"
            variant="h5"
            background="danger"
            style={{ justifySelf: "flex-end" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditMenu({
                accessString: `sections.${ids?.section?.index}.items`,
                action: "DELETE",
                value: {},
                internalIndex: ids?.item?.index,
              });
            }}>
            DELETE ITEM
          </Buttons.Button>
        </Layout.Grid>
      )}

      <MenuDisplayItem appMode={mode}>
        <Layout.Flex yAlign="flex-start">
          {mode === "edit" ? (
            <Inputs.Field
              fieldType="text"
              placeholder="Item Name"
              defaultValue={name}
              onChange={(e) => {
                e.preventDefault();
                handleMenuChange({
                  value: e.target.value,
                  accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.name`,
                });
              }}></Inputs.Field>
          ) : (
            <Typography.Typography
              weight="bold"
              textAlign="left"
              variant="p"
              color="textTertiary">
              {name}
            </Typography.Typography>
          )}

          {mode === "edit" ? (
            <Inputs.Field
              fieldType="text"
              placeholder="Item Description"
              defaultValue={description}
              onChange={(e) => {
                e.preventDefault();
                handleMenuChange({
                  value: e.target.value,
                  accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.description`,
                });
              }}></Inputs.Field>
          ) : (
            Boolean(description) && (
              <Typography.Typography
                margin="0 0 0 .5em"
                textAlign="left"
                variant="p"
                color="textTertiary"
                fontStyle="italic">
                {" "}
                {description}
              </Typography.Typography>
            )
          )}
        </Layout.Flex>

        <Layout.Flex
          xAlign="flex-end"
          yAlign="flex-end"
          column
          style={{ alignSelf: "flex-start" }}>
          {mode === "edit" ? (
            <Fragment>
              {menuToUpdate.sections[ids?.section?.index].items[
                ids?.item?.index
              ].price.map((p, priceIndex) => {
                return (
                  <Layout.Flex noWrap>
                    <Inputs.Field
                      fieldType="number"
                      placeholder="Item Price"
                      defaultValue={p.amount / 100}
                      onChange={(e) => {
                        const priceItem = {
                          ...p,
                          amount: e.target.value,
                          priceType: "amount",
                        };


                        handleMenuChange({
                          value: priceItem,
                          accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.price.${priceIndex}`,
                        });
                      }}></Inputs.Field>
                    {menuToUpdate.sections[ids?.section?.index].items[
                      ids?.item?.index
                    ].price.length > 1 && (
                      <Buttons.Icon
                        iconConfig={{ name: "delete" }}
                        onClick={(e) => {
                          setMounted(false);

                          const newPriceArray = menuToUpdate.sections[
                            ids?.section?.index
                          ].items[ids?.item?.index].price?.reduce(
                            (acc, price, currIndex) => {
                              if (priceIndex !== currIndex) acc.push(price);
                              return acc;
                            },
                            []
                          );

                          handleMenuChange({
                            value: newPriceArray,
                            accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.price`,
                          });

                          // setMounted(true)
                        }}></Buttons.Icon>
                    )}
                  </Layout.Flex>
                );
              })}
              <Buttons.Icon
                iconConfig={{ name: "add" }}
                onClick={(e) => {
                  setMounted(false);
                  handleMenuChange({
                    value: [...price, defaultPrice()],
                    accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.price`,
                  });

                  // setMounted(true)
                }}></Buttons.Icon>
            </Fragment>
          ) : (
            <Typography.Typography
              displayAlign={{
                alignSelf: "flex-end",
                justifySelf: "flex-end",
              }}
              textAlign="right"
              variant="p"
              color="textTertiary"
              style={{ whiteSpace: "nowrap" }}>
              {_getPriceDisplay({ price })} {unit && `- ${unit}`}
            </Typography.Typography>
          )}
        </Layout.Flex>
      </MenuDisplayItem>
      <MenuDisplayLoopWrapper
        items={item.options}
        ids={ids}
        type="option"
        menuToUpdate={menuToUpdate}
        menuDisplayConfig={menuDisplayConfig}
        setMenuDisplayConfig={setMenuDisplayConfig}
        setMenuToUpdate={setMenuToUpdate}
        handleMenuChange={handleMenuChange}
        handleEditMenu={handleEditMenu}></MenuDisplayLoopWrapper>
    </Layout.Flex>
  ) : (
    <div></div>
  );
};

interface PropsMenuOption extends PropsGeneric {
  option: ArgumentsMenuOptions;

  provided?: any;
}

const MenuOption: React.FC<PropsMenuOption> = (props) => {
  const { mode, user } = store.defaultState;
  const {
    handleMenuChange,
    option,
    menuToUpdate,
    menuDisplayConfig,
    setMenuToUpdate,
    setMenuDisplayConfig,
    handleEditMenu,
    provided,
    ids,
  } = props;
  const { name, price } = option;

  return (
    <Fragment>
      {mode === "edit" && (
        <Layout.Grid padding=".8em 0 .3em" layout={[50, 50]}>
          <Content.Icon
            {...provided.dragHandleProps}
            padding=".25em"
            type="icon"
            color="primary"
            name="pan_tool"></Content.Icon>

          <Buttons.Button
            margin=".25em 0 0"
            color="white"
            variant="h5"
            background="danger"
            style={{ justifySelf: "flex-end" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditMenu({
                accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.options`,
                action: "DELETE",
                value: {},
                internalIndex: ids?.option?.index,
              });
            }}>
            DELETE OPTION
          </Buttons.Button>
        </Layout.Grid>
      )}

      <MenuDisplayOption>
        <Layout.Flex yAlign="flex-start">
          {mode === "edit" ? (
            <Inputs.Field
              fieldType="text"
              placeholder="Option Name"
              defaultValue={name}
              onChange={(e) => {
                e.preventDefault();
                handleMenuChange({
                  value: e.target.value,
                  accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.options.${ids?.option?.index}.name`,
                });
              }}></Inputs.Field>
          ) : (
            <Typography.Typography
              textAlign="left"
              variant="p"
              color="textTertiary">
              - {name}
            </Typography.Typography>
          )}
        </Layout.Flex>
        <Layout.Flex
          xAlign="flex-end"
          yAlign="flex-end"
          column
          style={{ alignSelf: "flex-start" }}>
          {mode === "edit" ? (
            price.map((p, priceIndex) => {
              return (
                <Inputs.Field
                  fieldType="number"
                  placeholder="Option Price"
                  defaultValue={p.amount / 100}
                  onChange={(e) => {
                    handleMenuChange({
                      value: e.target.value,
                      accessString: `sections.${ids?.section?.index}.items.${ids?.item?.index}.options.${ids?.option?.index}.price.${priceIndex}.amount`,
                    });
                  }}></Inputs.Field>
              );
            })
          ) : (
            <Typography.Typography
              displayAlign={{
                alignSelf: "flex-end",
                justifySelf: "flex-end",
              }}
              textAlign="right"
              variant="p"
              color="textTertiary"
              style={{ whiteSpace: "nowrap" }}>
              {_getPriceDisplay({ price })}
              {/* {unit && `- ${unit}`} */}
            </Typography.Typography>
          )}
        </Layout.Flex>
      </MenuDisplayOption>
    </Fragment>
  );
};
const MenuDisplayHeader = ({
  name,
  handleMenuChange,
  handleEditMenu,
  menuToUpdate,
  displayName,
}) => {
  const { mode } = store.defaultState;

  
  return (
    <Layout.Flex column margin=".5em 0">
      {mode === "edit" && (
        <Layout.Grid margin="0 .5em 1em" layout={[50, 50]}>
          <Buttons.Button
            margin=".25em 0 0"
            color="white"
            variant="h5"
            background="safe"
            style={{ justifySelf: "flex-start" }}
            onClick={async (e) => {
              e.stopPropagation();
              await store.defaultMenuHandler({ menu: menuToUpdate });
            }}>
            SAVE MENU
          </Buttons.Button>
          <Buttons.Button
            margin=".25em 0 0"
            color="white"
            variant="h5"
            background="safe"
            style={{ justifySelf: "flex-start" }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditMenu({
                accessString: `sections`,
                action: "ADD",
                value: defaultSection(),
                internalIndex: 0,
              });
            }}>
            ADD SECTION
          </Buttons.Button>
        </Layout.Grid>
      )}
      {mode === "edit" ? (
        <Inputs.Field
          fieldType="text"
          placeholder="Menu Name"
          defaultValue={displayName}
          onChange={(e) => {
            e.preventDefault();
            handleMenuChange({
              value: e.target.value,
              accessString: `displayName`,
            });
          }}></Inputs.Field>
      ) : (
        <Typography.Typography
          color="textTertiary"
          variant="h3"
          textAlign="center"
         
          margin="0 0 1em">
          {displayName}
        </Typography.Typography>
      )}
    </Layout.Flex>
  );
};

const MenuDisplay = observer((props: { id: String; children?: any }) => {
  const { id } = props;
  const { mode } = store.defaultState;

  const defaultMenuToUpdate: ArgumentsMenu = { name: "", sections: [] };

  const defaultMenuDisplayConfig: {
    menu: ArgumentsMenu;
    mounted: boolean;
  } = {
    menu: defaultMenuToUpdate,
    mounted: false,
  };

  const [menuDisplayConfig, setMenuDisplayConfig] = useState(
    defaultMenuDisplayConfig
  );
  const [menuToUpdate, setMenuToUpdate] = useState(defaultMenuToUpdate);

  const handleMount = () => {
    setMenuDisplayConfig(defaultMenuDisplayConfig);
    const menu = store.defaultState?.menus?.[id]
      ? toJS(store.defaultState?.menus?.[id])
      : [];

    setMenuDisplayConfig({ menu, mounted: true });
    setMenuToUpdate(menu);
  };

  const handleMenuChange = ({
    value,
    accessString,
  }: {
    value: any;
    accessString: string;
  }) => {
    const newMenuItems = menuToUpdate;
    _.set(newMenuItems, accessString, value);
    setMenuToUpdate(newMenuItems);
  };

  const handleEditMenu = ({
    action,
    value,
    accessString,
    internalIndex,
  }: ArgumentsHandleEditMenu) => {
    const newMenuToUpdate = menuToUpdate;

    if (action === "ADD") {
      const navSectionItems = _.get(menuToUpdate, accessString);
      navSectionItems.unshift(value);
      _.set(newMenuToUpdate, `${accessString}`, navSectionItems);
    } else if (action === "DELETE") {
      const navSectionItems = _.get(menuToUpdate, accessString);
      navSectionItems.splice(internalIndex, 1);
      _.set(newMenuToUpdate, `${accessString}`, navSectionItems);
    }

    setMenuDisplayConfig({
      ...menuDisplayConfig,
      menu: newMenuToUpdate,
    });
    setMenuToUpdate(newMenuToUpdate);
  };

  useEffect(() => {
    handleMount();
  }, []);

  return menuDisplayConfig.mounted ? (
    <Vessel>
      <MenuDisplayHeader
        name={menuDisplayConfig.menu.name}
        menuToUpdate={menuToUpdate}
        displayName={menuDisplayConfig.menu.displayName}
        handleMenuChange={handleMenuChange}
        handleEditMenu={handleEditMenu}></MenuDisplayHeader>

      <MenuDisplayLoopWrapper
        items={Array.from(Object.values(menuDisplayConfig.menu.sections))}
        ids={{}}
        type="section"
        menuToUpdate={menuToUpdate}
        menuDisplayConfig={menuDisplayConfig}
        setMenuDisplayConfig={setMenuDisplayConfig}
        setMenuToUpdate={setMenuToUpdate}
        handleMenuChange={handleMenuChange}
        handleEditMenu={handleEditMenu}></MenuDisplayLoopWrapper>
      {props.children}
    </Vessel>
  ) : (
    <div></div>
  );
});

export default MenuDisplay;
