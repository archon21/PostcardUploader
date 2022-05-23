import React, { Fragment, useEffect, useState } from "react";
import { observer } from "mobx-react";
let xlsx = require("json-as-xlsx");
import styled from "styled-components";

import store from "../store";

import {
  Layout,
  Typography,
  Content,
  Inputs,
  Element,
  Composed,
  Buttons,
} from "../components";
import { siteConfig } from "../../site-config";
import NavMenu from "../components/Nav/NavMenus";
import NavLogo from "../components/Nav/NavLogo";
import DesktopMenu from "../components/Nav/NavMenus/DesktopMenu";
import Util from "../util";
import { toJS } from "mobx";

interface DefaultState {
  base: Array<string>;
}

interface Props {
  defaultState: DefaultState;
}

const Home: React.FC<Props> = (props) => {
  const [pageConfig, setPageConfig] = useState({ mounted: false });

  const handleMount = async () => {
    await store.defaultStateGetter({ htmlRouteAccess: "Home" });

    setPageConfig({ ...pageConfig, mounted: true });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    await store.cardUploader({ images: [...e.target.files] });
  };

  const convertToExcel = async () => {
    const columns = [
      {
        label: "*Action(SiteID=US|Country=US|Currency=USD|Version=1193)",
        value: "action",
      }, // Top level data
      { label: "Custom label (SKU)", value: "sku" },
      {
        label: "Category name",
        value: "categoryName",
      },
      {
        label: "Title",
        value: "title",
      },
      {
        label: "Relationship",
        value: "relationship",
      },
      {
        label: "Relationship details",
        value: "relationshipDetails",
      },
      {
        label: "P:UPC",
        value: "upc",
      },
      {
        label: "P:ISBN",
        value: "isbn",
      },
      {
        label: "P:EAN",
        value: "ean",
      },
      {
        label: "P:EPID",
        value: "epid",
      },
      {
        label: "Start price",
        value: "startPrice",
      },
      {
        label: "Quantity",
        value: "quantity",
      },
      {
        label: "Item photo URL",
        value: "primaryPhotoUrl",
      },
      {
        label: "Condition ID",
        value: "conditionId",
      },
      {
        label: "Description",
        value: "description",
      },
      {
        label: "Format",
        value: "format",
      },
      {
        label: "Duration",
        value: "duration",
      },
      {
        label: "Buy It Now price",
        value: "buyItNowPrice",
      },
      {
        label: "Paypal accepted",
        value: "paypalAccepted",
      },
      {
        label: "Paypal email address",
        value: "paypalEmailAddress",
      },
      {
        label: "Immediate pay required",
        value: "immediatePayRequired",
      },
      {
        label: "Payment instructions",
        value: "payInstructions",
      },
      {
        label: "Location",
        value: "location",
      },
      {
        label: "Shipping service 1 option",
        value: "shippingService1Option",
      },
      {
        label: "Shipping service 1 cost",
        value: "shippingService1Cost",
      },
      {
        label: "Shipping service 1 priority",
        value: "shippingService1Priority",
      },
      {
        label: "Shipping service 2 option",
        value: "shippingService2Option",
      },
      {
        label: "Shipping service 2 cost",
        value: "shippingService2Cost",
      },
      {
        label: "Shipping service 2 priority",
        value: "shippingService2Priority",
      },
      {
        label: "Max dispatch time",
        value: "maxDispatchTime",
      },
      {
        label: "Returns accepted option",
        value: "returnsAcceptedOption",
      },
      {
        label: "Returns within option",
        value: "returnsWithinOption",
      },
      {
        label: "Refund option",
        value: "refundOption",
      },
      {
        label: "Return shipping cost paid by",
        value: "returnShippingCostPaidBy",
      },
      {
        label: "Shipping profile name",
        value: "shippingProfileName",
      },
      {
        label: "Return profile name",
        value: "returnsProfileName",
      },
      {
        label: "Payment profile name",
        value: "paymentProfileName",
      },
      {
        label: "TakeBackPolicyID",
        value: "takeBackPolicyID",
      },
      {
        label: "ProductCompliancePolicyID",
        value: "productCompliancePolicyID",
      },
      {
        label: "C:Subject",
        value: "cSubject",
      },
      {
        label: "C:Theme",
        value: "cTheme",
      },
      {
        label: "C:Occasion",
        value: "cOccasion",
      },
      {
        label: "C:Type",
        value: "cType",
      },
      {
        label: "C:Artist",
        value: "cArtist",
      },
      {
        label: "C:Country/Region of Manufacture",
        value: "cCountry",
      },
      {
        label: "C:Unit of Sale",
        value: "cUnitOfSale",
      },
      {
        label: "C:Postage Condition",
        value: "cPostageCondition",
      },
      {
        label: "C:Original/Licensed Reprint",
        value: "cOriginalOrLicensed",
      },
      {
        label: "C:Era",
        value: "cEra",
      },
      {
        label: "C:City",
        value: "cCity",
      },
      {
        label: "C:Region",
        value: "cRegion",
      },
      {
        label: "C:Country",
        value: "cCountry",
      },
    ];

    let data = [
      {
        sheet: "Products",
        columns,
        content: store.defaultState.content.map((item) => {
          const {
            items: {
              photoOne,
              photoTwo,
              textDetectionOne,
              textDetectionTwo,
              sku,
            },
          } = item;
          return {
            action: "ADD",
            buyItNowPrice: 7.99,
            cArtist: "NA",
            cCity: "",
            cCountry: "United States",
            cEra: "LINEN",
            cOccasion: "NA",
            cOriginalOrLicensed: "Original",
            cPostageCondition: "C:Postage Condition",
            cRegion: "",
            cSubject: "",
            cTheme: "",
            cType: "Linen Postcard",
            cUnitOfSale: "C:Unit of Sale",
            categoryName:
              "/Collectibles/Postcards & Supplies/Postcards/Non-Topographical Postcards",
            conditionId: `3000-Used`,
            description: textDetectionTwo.replace('\n', " "),
            duration: "GTC",
            ean: "",
            epid: "",
            format: "FixedPrice",
            immediatePayRequired: "",
            isbn: "",
            location: "Norwich, CT",
            maxDispatchTime: "",
            payInstructions: "",
            paymentProfileName: "eBay Payments",
            paypalAccepted: 1,
            paypalEmailAddress: "EMAIL_HERE",
            primaryPhotoUrl: `${photoOne} ${photoTwo}`,
            productCompliancePolicyID: "",
            quantity: 1,
            refundOption: "",
            relationship: "Variation",
            relationshipDetails: "",
            returnShippingCostPaidBy: "",
            returnsAcceptedOption: "",
            returnsProfileName: "Returns Accepted,Seller,30 Days,Money back or",
            returnsWithinOption: "",
            shippingProfileName: "#Postcard",
            shippingService1Cost: "",
            shippingService1Option: "",
            shippingService1Priority: "",
            shippingService2Cost: "",
            shippingService2Option: "",
            shippingService2Priority: "",
            sku: `PCO${sku}`,
            startPrice: 7.99,
            takeBackPolicyID: "",
            title: `Postcard: ${textDetectionOne}`
              .replace("\n", " ")
              .slice(0, 70),
            upc: "",
          };
        }),
      },
    ];

    let settings = {
      fileName: "MySpreadsheet", // Name of the resulting spreadsheet
      extraLength: 3, // A bigger number means that columns will be wider
      writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
    };

    xlsx(data, settings);
  };

  const handleOcr = async () => {
    setPageConfig({ ...pageConfig, mounted: false });
    const res = await Util.Request({
      url: "/api/ocr",
      method: "POST",
      data: {
        objects: store.defaultState.content,
      },
    });
    handleMount();
  };

  const handleDelete = async () => {
    setPageConfig({ ...pageConfig, mounted: false });

    await Util.Request({ url: "/api/content", method: "DELETE" });
    handleMount();
  };

  useEffect(() => {
    handleMount();
  }, []);

  return pageConfig.mounted ? (
    <React.Fragment>
      <Layout.WindoW
        id="home"
        init
        xAlign="flex-start"
        yAlign="flex-start"
        column>
        <Layout.Flex
          margin="1em 0 0 0"
          column
          xAlign="center"
          yAlign="flex-start">
          <Layout.Flex
            margin="1em 0 0 0"
            column
            xAlign="flex-start"
            yAlign="flex-start">
            <Typography.Typography
              textAlign="left"
              displayAlign={{ alignSelf: "flex-start" }}
              variant="span">
              Step One: Upload multiple files (even number in pairs in correct
              order), then reload after a few seconds
            </Typography.Typography>
            <form
              // onSubmit={handleUpload}
              action="/api/storage"
              method="POST"
              encType="multipart/form-data">
              <input type="file" name="files" multiple></input>
              <Buttons.Button
                margin="1em 0 0"
                variant="h6"
                onClick={null}
                type="submit">
                Upload to Storage
              </Buttons.Button>
            </form>
          </Layout.Flex>
          <Layout.Flex
            margin="1em 0 0 0"
            column
            xAlign="flex-start"
            yAlign="flex-start">
            <Typography.Typography
              textAlign="left"
              displayAlign={{ alignSelf: "flex-start" }}
              variant="span">
              Step Two: Click "OCR Scan" to get Title and Description
            </Typography.Typography>
            <Buttons.Button
              disabled={!store.defaultState.content?.length}
              margin="1em 0 0"
              variant="h6"
              onClick={handleOcr}>
              OCR Scan
            </Buttons.Button>
          </Layout.Flex>
          <Layout.Flex
            margin="1em 0 0 0"
            column
            xAlign="flex-start"
            yAlign="flex-start">
            <Typography.Typography
              textAlign="left"
              displayAlign={{ alignSelf: "flex-start" }}
              variant="span">
              Step Three: Once everything looks good click "Export to XLSX"
            </Typography.Typography>
            <Buttons.Button
              disabled={!store.defaultState.content?.length}
              margin="1em 0 0"
              variant="h6"
              onClick={convertToExcel}>
              Export to XLSX
            </Buttons.Button>
          </Layout.Flex>
          <Layout.Flex
            margin="1em 0 0 0"
            column
            xAlign="flex-start"
            yAlign="flex-start">
            <Typography.Typography
              textAlign="left"
              displayAlign={{ alignSelf: "flex-start" }}
              variant="span">
              Step Four: Delete the current items
            </Typography.Typography>
            <Buttons.Button
              color="white"
              background="danger"
              disabled={!store.defaultState.content?.length}
              margin="1em 0 0"
              variant="h6"
              onClick={handleDelete}>
              Delete
            </Buttons.Button>
          </Layout.Flex>

          {store.defaultState.content?.length ? (
            <table>
              <thead>
                <tr>
                  <th>
                    <Typography.Typography whiteSpace="nowrap" variant="span">
                      URL One
                    </Typography.Typography>
                  </th>
                  <th>
                    <Typography.Typography whiteSpace="nowrap" variant="span">
                      URL Two
                    </Typography.Typography>
                  </th>
                  <th>
                    <Typography.Typography variant="span">
                      Title
                    </Typography.Typography>
                  </th>
                  <th>
                    <Typography.Typography variant="span">
                      Description
                    </Typography.Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {store.defaultState?.content?.map((item) => {
                  return (
                    <tr>
                      <td>
                        {" "}
                        <SmallImage
                          onClick={() => {
                            window.open(item?.items?.photoOne, "_blank");
                          }}
                          src={item?.items?.photoOne}></SmallImage>
                      </td>
                      <td>
                        <SmallImage
                          onClick={() => {
                            window.open(item?.items?.photoTwo, "_blank");
                          }}
                          src={item?.items?.photoTwo}></SmallImage>
                      </td>
                      <td>
                        <Typography.Typography variant="span">
                          {item?.items?.textDetectionOne}
                        </Typography.Typography>
                      </td>
                      <td>
                        <Typography.Typography variant="span">
                          {item?.items?.textDetectionTwo}
                        </Typography.Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <Typography.Typography variant="p">
              No postcards to export{" "}
            </Typography.Typography>
          )}
        </Layout.Flex>
      </Layout.WindoW>
    </React.Fragment>
  ) : (
    <Fragment></Fragment>
  );
};

export default observer(Home);

const SmallImage = styled.img`
  width: 4em;
  height: 4em;
  cursor: pointer;
`;
