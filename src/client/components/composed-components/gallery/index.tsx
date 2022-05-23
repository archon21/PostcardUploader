import React, { Component, useEffect, useState } from "react";
import styled from "styled-components";
import { useLocalStore, observer } from "mobx-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Content } from "../../index";
import { siteConfig } from "../../../../site-config";
import store from "../../../store";

interface Props {
  padding?: string;
  imageConfig: {
    items: Array<{ src: string; boxShadow: boolean }>;
    itemSpacing: string;
    dimensionsConfig: {
      width: string;
      height?: string;
    };
  };
  layoutConfig: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

const Vessel = styled.div<Props>`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(
    auto-fill,
    ${(props) => props.layoutConfig.desktop}%
  );
  grid-gap: ${(props) => props.imageConfig.itemSpacing || "auto"};
  justify-content: center;

  @media screen and (max-width: ${siteConfig.client.required.layouts
      .tablet}px) {
    grid-template-columns: repeat(
      auto-fill,
      ${(props) => props.layoutConfig.tablet}%
    );
  }

  @media screen and (max-width: ${siteConfig.client.required.layouts
      .mobile}px) {
    grid-template-columns: repeat(
      auto-fill,
      ${(props) => props.layoutConfig.mobile}%
    );
  }
`;

const EditingVessel = styled.div<Props>`
  display: flex;
  width: 100%;
  overflow: auto;
  flex-wrap: nowrap;
`;
const Gallery: React.FC<Props> = (props) => {
  const { mode } = store.defaultState;

  const { imageConfig } = props;

  const [items, setItems] = useState([]);

  const onDragEnd = (droppedItem) => {
    if (!droppedItem.destination) return;
    var updatedList = [...items];

    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
    setItems(updatedList);

  };

  useEffect(() => {
    setItems(imageConfig.items);
  }, []);

  return mode === "edit" ? (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={`gallery-list-container`} direction="horizontal">
        {(provided) => (
          <EditingVessel
            {...props}
            className={`gallery-list-container`}
            {...provided.droppableProps}
            ref={provided.innerRef}>
            {items.map((item, index) => {

              return (
                <Draggable
                  key={String(item.id)}
                  draggableId={String(item.id)}
                  index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`type-container`}>
                      <Content.Image
                        // onClick={to}
                        key={index}
                        {...item}
                        {...props.imageConfig.dimensionsConfig}></Content.Image>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </EditingVessel>
        )}
      </Droppable>
    </DragDropContext>
  ) : (
    <Vessel {...props}>
      {items.map((item, index) => {
        return (
          <Content.Image
            // onClick={to}
            key={index}
            {...item}
            {...props.imageConfig.dimensionsConfig}></Content.Image>
        );
      })}
    </Vessel>
  );
};

export default Gallery;
