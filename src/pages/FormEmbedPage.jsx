import React, { useState, useEffect, useMemo } from "react";
import Formatic, { Overrides, Data, Events } from "@transformd-ltd/sdk";
import ElectronicVerification from "@transformd-ltd/electronic-verification";
import UserLookupComponent from "@transformd-ltd/user-lookup";
import AbnLookupComponent from "@transformd-ltd/abn-lookup";
import ProfileLookupComponent from "@transformd-ltd/profile-lookup";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import API from "../API";
import { useParams } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  Loading,
  TaskAlreadyCompletedWarning,
  TaskNotAssignedWarning,
} from "./ApprovalTaskPage";

function FullscreenForm(props) {
  const {
    apiUrl,
    sdkApiUrl,
    subscriptionApiUrl,
    dataHelper,
    submission,
    task,
    env,
    channel,
    onRefresh,
    assignment,
  } = props;

  const formaticProps = {
    data: dataHelper,
    apiServerUrl: apiUrl,
    serverUrl: sdkApiUrl,
    subscriptionServerUrl: subscriptionApiUrl,
    submissionId: submission.id,
    formId: Number(env.FORM_ID),
    apiKey: env.API_KEY,
    environment: submission.branch,
    channel: channel,
  };
  console.log({ formaticProps });

  const [outcomeResponse, setOutcomeResponse] = useState(false);

  useEffect(() => {
    const createDownloadSection = async () => {
      var downloadSection = document.createElement("div");
      downloadSection.className = "upload-header";
      var sectionHeader = document.createElement("h1");
      if (env.UPLOAD_SECTION_TITLE) {
        var headerContent = document.createTextNode(env.UPLOAD_SECTION_TITLE);
        sectionHeader.appendChild(headerContent);
      } else {
        var headerContent = document.createTextNode("Uploads");
        sectionHeader.appendChild(headerContent);
      }
      downloadSection.append(sectionHeader);

      const arrUploadId = env.UPLOAD_SECTION_FIELD_IDS.split(",").map(function(
        fieldId
      ) {
        return fieldId.trim();
      });

      API.submissions
        .retrieve(formaticProps.submissionId)
        .then((res) => {
          for (const field in res.data.values) {
            if (res.data.values[field].type === "fileUpload") {
              const fieldId = res.data.values[field].self_url.split("/");
              for (const allowedId of arrUploadId) {
                if (fieldId[fieldId.length - 1] === allowedId) {
                  if (!isEmpty(res.data.values[field].files)) {
                    for (
                      let fileCounter = 0;
                      fileCounter < res.data.values[field].files.length;
                      fileCounter++
                    ) {
                      var downloadButton = document.createElement("button");
                      downloadButton.className = "download-buttons";
                      var buttonLabel = document.createTextNode(
                        fileCounter > 0
                          ? `${field}_(${fileCounter}).${res.data.values[
                              field
                            ].files[fileCounter].filename
                              .split(".")
                              .pop()}`
                          : `${field}.${res.data.values[field].files[
                              fileCounter
                            ].filename
                              .split(".")
                              .pop()}`
                      );
                      downloadButton.appendChild(buttonLabel);
                      downloadButton.addEventListener("click", async () => {
                        downloadOnClick(
                          res.data.values[field].files[fileCounter].id,
                          fileCounter > 0
                            ? `${field}_(${fileCounter}).${res.data.values[
                                field
                              ].files[fileCounter].filename
                                .split(".")
                                .pop()}`
                            : `${field}.${res.data.values[field].files[
                                fileCounter
                              ].filename
                                .split(".")
                                .pop()}`
                        );
                      });
                      downloadSection.append(downloadButton);
                    }
                  }
                }
              }
            } else if (res.data.values[field].type === "repeatable") {
              for (
                let repeatableCounter = 0;
                repeatableCounter < res.data.values[field].value.length;
                repeatableCounter++
              ) {
                for (const fieldName in res.data.values[field].value[
                  repeatableCounter
                ].values) {
                  if (
                    res.data.values[field].value[repeatableCounter].values[
                      fieldName
                    ].type === "fileUpload"
                  ) {
                    const fieldId =
                      res.data.values[field].value[repeatableCounter].values[
                        fieldName
                      ].field_id;
                    for (const allowedId of arrUploadId) {
                      if (fieldId === allowedId) {
                        if (
                          !isEmpty(
                            res.data.values[field].value[repeatableCounter]
                              .values[fieldName].value
                          )
                        ) {
                          for (
                            let fileCounter = 0;
                            fileCounter <
                            res.data.values[field].value[repeatableCounter]
                              .values[fieldName].value.length;
                            fileCounter++
                          ) {
                            var downloadButton = document.createElement(
                              "button"
                            );
                            downloadButton.className = "download-buttons";
                            var buttonLabel = document.createTextNode(
                              fileCounter > 0
                                ? `${fieldName}_(${fileCounter}).${res.data.values[
                                    field
                                  ].value[repeatableCounter].values[
                                    fieldName
                                  ].value[fileCounter].filename
                                    .split(".")
                                    .pop()}`
                                : `${fieldName}.${res.data.values[field].value[
                                    repeatableCounter
                                  ].values[fieldName].value[
                                    fileCounter
                                  ].filename
                                    .split(".")
                                    .pop()}`
                            );
                            downloadButton.appendChild(buttonLabel);
                            downloadButton.addEventListener(
                              "click",
                              async () => {
                                downloadOnClick(
                                  res.data.values[field].value[
                                    repeatableCounter
                                  ].values[fieldName].value[fileCounter]
                                    .upload_id,
                                  fileCounter > 0
                                    ? `${fieldName}_(${fileCounter}).${res.data.values[
                                        field
                                      ].value[repeatableCounter].values[
                                        fieldName
                                      ].value[fileCounter].filename
                                        .split(".")
                                        .pop()}`
                                    : `${fieldName}.${res.data.values[
                                        field
                                      ].value[repeatableCounter].values[
                                        fieldName
                                      ].value[fileCounter].filename
                                        .split(".")
                                        .pop()}`
                                );
                              }
                            );
                            downloadSection.append(downloadButton);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        })
        .then(() => {
          let aboveField = document.getElementsByName(env.UPLOAD_ABOVE);
          aboveField[0].parentElement.prepend(downloadSection);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const downloadOnClick = async (uploadId, filename) => {
      API.downloadFile
        .retrieve(formaticProps.submissionId, uploadId)
        .then((res) => {
          let tempLink = document.createElement("a");
          tempLink.href = window.URL.createObjectURL(res.data);
          tempLink.setAttribute("download", filename);
          tempLink.click();
        })
        .catch((err) => {});
    };

    const apiV3ActionTask = (actionButton) => {
      API.assignments
        .update(assignment.task.id, assignment.id, {
          current_state: actionButton.outcome,
        })
        .then(() => {
          setOutcomeResponse({
            outcomeType: "success",
            outcomeMessage: "Task successfully updated",
          });

          // if redirectPage is a URL:
          if (actionButton.redirectPage.includes("http")) {
            window.top.location.href = actionButton.redirectPage;
          } else {
            formaticProps.data.store.dispatch({
              type: "SET_CURRENT_PAGE",
              channel: channel,
              pageId: actionButton.redirectPage,
              requestTimestamp: Date.now(),
            });
          }
        })
        .catch((err) => {
          console.log(err);
          const errorMessage = Object.values(err.response.data.errors)[0];
          setOutcomeResponse({
            outcomeType: "error",
            outcomeMessage: errorMessage,
          });
        });
    };

    if (formaticProps.data.store) {
      const emitter = formaticProps.data.getEmitter();
      const data = formaticProps.data;
      emitter.on(Events.PageRender, (data) => {
        const splitcontainer = document.getElementById(
          `formatic-page-container-${env.PAGE_ID}`
        );
        if (splitcontainer) {
          splitcontainer.classList.add("flex-section-container");
          const leftPage = document.getElementById(
            `formatic-section-container-${env.SECTION_LEFT}`
          );
          leftPage.classList.add("section-one");
          const rightPage = document.getElementById(
            `formatic-section-container-${env.SECTION_RIGHT}`
          );
          rightPage.classList.add("section-two");
          if (env.UPLOAD_ABOVE) {
            createDownloadSection();
          }
        }
      });

      const actionButtons = env.TASK_ACTION_BUTTONS
        ? JSON.parse(env.TASK_ACTION_BUTTONS)
        : null;

      actionButtons &&
        actionButtons.forEach((actionButton) => {
          emitter.on(Events.ButtonClicked, (data) => {
            if (data.fieldId === actionButton.buttonFieldId) {
              apiV3ActionTask(actionButton);
            }
          });
        });
    }
  }, [formaticProps.data]);

  return (
    <>
      <Formatic {...formaticProps}>
        <Overrides.OverrideFieldContainer
          component={AbnLookupComponent}
          // this dosnt work but we need this for api
          type="abnLookup"
        />
        <Overrides.OverrideFieldContainer
          type="electronicVerification"
          component={ElectronicVerification}
        />
        <Overrides.OverrideFieldContainer
          type="profileLookup"
          component={ProfileLookupComponent}
        />
        <Overrides.OverrideFieldContainer
          type="userLookup"
          component={UserLookupComponent}
        />
      </Formatic>

      {outcomeResponse && (
        <p className={`api-v3-outcome-message ${outcomeResponse.outcomeType}`}>
          {outcomeResponse.outcomeMessage}
        </p>
      )}
    </>
  );
}

export default function FormEmbedPage(props) {
  const { task, assignment, rootAppUrl, env } = props;
  const params = useParams();
  const [submission, setSubmission] = useState(null);
  const dataHelper = useMemo(() => new Data(), []);

  useEffect(() => {
    if (!params.submissionId) {
      return;
    }

    API.submissions
      .retrieve(params.submissionId)
      .then((res) => setSubmission(res.data))
      .catch((err) => {
        console.error(err);
      });
  }, [params]);

  const channel = get(params, "channel", "master");

  function handleRefresh() {
    props.onComplete();
  }

  if (!submission) {
    return (
      <div>
        <Loading />
      </div>
    );
    return <Loading />;
  }

  if (!assignment) {
    return <TaskNotAssignedWarning />;
  }

  if (assignment.current_state === "complete") {
    return <TaskAlreadyCompletedWarning />;
  }

  return (
    <div className="max-w-7xl	m-auto px-8">
      <ErrorBoundary>
        <FullscreenForm
          key={channel}
          channel={channel}
          dataHelper={dataHelper}
          submission={submission}
          task={task}
          env={env}
          onRefresh={handleRefresh}
          apiUrl={props.apiUrl}
          sdkApiUrl={props.sdkApiUrl}
          subscriptionApiUrl={props.subscriptionApiUrl}
          assignment={assignment}
        />
      </ErrorBoundary>
    </div>
  );
}
