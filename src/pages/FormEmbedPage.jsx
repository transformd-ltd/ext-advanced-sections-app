import React, { useState, useEffect, useMemo } from "react";
import Formatic, { Data, Events } from "@transformd-ltd/sdk";
import axios from "axios";
import get from "lodash/get";
import API from "../API";
import {useParams} from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import {Loading, TaskAlreadyCompletedWarning, TaskNotAssignedWarning} from "./ApprovalTaskPage";

function FullscreenForm(props) {
  const {
    apiUrl,
    sdkApiUrl,
    subscriptionApiUrl,
    dataHelper,
    submission,
    task,
    env,
    error,
    channel,
    onRefresh
  } = props;

  const formaticProps = {
    data: dataHelper,
    apiServerUrl: apiUrl,
    serverUrl: sdkApiUrl,
    subscriptionServerUrl: subscriptionApiUrl,
    submissionId: submission.id,
    formId: Number(env.FORM_ID),
    apiKey: env.API_KEY,
    environment: env.BRANCH,
    channel: channel,
  };
  console.log({ formaticProps });

  useEffect(() => {

    const createDownloadSection = async () => {
      var downloadSection = document.createElement('div');
      downloadSection.className = "upload-header";
      var sectionHeader = document.createElement('h1');
      var headerContent = document.createTextNode('Uploads');
      sectionHeader.appendChild(headerContent);
      downloadSection.append(sectionHeader);
      API.submissions.retrieve(formaticProps.submissionId)
      .then((res) => {
        for (const field in res.data.values) {
          if (res.data.values[field].type === "fileUpload") {
            if (res.data.values[field].files) {
              for (let fileCounter = 0; fileCounter < res.data.values[field].files.length; fileCounter++) {
                var downloadButton = document.createElement("button");
                downloadButton.className = "download-buttons";
                var buttonLabel = document.createTextNode(`${field}.${res.data.values[field].files[fileCounter].filename.split('.').pop()}`);
                downloadButton.appendChild(buttonLabel);
                downloadButton.addEventListener('click', async () => {downloadOnClick(res.data.values[field].files[fileCounter].id, `${field}.${res.data.values[field].files[fileCounter].filename.split('.').pop()}`)});
                downloadSection.append(downloadButton);
              }
            }
          } else if (res.data.values[field].type === "repeatable") {
            for (let repeatableCounter = 0; repeatableCounter < res.data.values[field].value.length; repeatableCounter++) {
              for (const fieldName in res.data.values[field].value[repeatableCounter].values) {
                if (res.data.values[field].value[repeatableCounter].values[fieldName].type === "fileUpload") {
                  if (res.data.values[field].value[repeatableCounter].values[fieldName].value) {
                    for (let fileCounter = 0; fileCounter < res.data.values[field].value[repeatableCounter].values[fieldName].value.length; fileCounter++) {
                      var downloadButton = document.createElement("button");
                      downloadButton.className = "download-buttons";
                      var buttonLabel = document.createTextNode(`${fieldName}.${res.data.values[field].value[repeatableCounter].values[fieldName].value[fileCounter].filename.split('.').pop()}`);
                      downloadButton.appendChild(buttonLabel);
                      downloadButton.addEventListener('click', async () => {downloadOnClick(res.data.values[field].value[repeatableCounter].values[fieldName].value[fileCounter].upload_id, `${fieldName}.${res.data.values[field].value[repeatableCounter].values[fieldName].value[fileCounter].filename.split('.').pop()}`)});
                      downloadSection.append(downloadButton);
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
      API.downloadFile.retrieve(formaticProps.submissionId, uploadId)
        .then((res) => {
          let tempLink = document.createElement('a');
          tempLink.href = window.URL.createObjectURL(res.data);
          tempLink.setAttribute('download', filename);
          tempLink.click();
        })
        .catch((err) => {
          
        })
    }

    if (formaticProps.data.store) {
      const emitter = formaticProps.data.getEmitter();
      emitter.on(Events.PageRender, data => {
        const splitcontainer = document.getElementById(`formatic-page-container-${env.PAGE_ID}`);
        splitcontainer.classList.add('flex-section-container');
        const leftPage = document.getElementById(`formatic-section-container-${env.SECTION_LEFT}`);
        leftPage.classList.add('section-one');
        const rightPage = document.getElementById(`formatic-section-container-${env.SECTION_RIGHT}`);
        rightPage.classList.add('section-two');
        if (env.UPLOAD_ABOVE) {
          createDownloadSection();
        };
      });
    };
  }, [formaticProps.data]);

  return (
    <Formatic
      {...formaticProps}
    />
  )

}

export default function FormEmbedPage(props) {
  const { task, assignment, rootAppUrl, env } = props;
  const params = useParams();
  const [submission, setSubmission] = useState(null);
  const dataHelper = useMemo(() => new Data(), []);
  const [error, setError] = useState(null);

  console.log('FormEmbedPage', { params });

  useEffect(() => {
    if (!params.submissionId) {
      return;
    }

    API.submissions.retrieve(params.submissionId)
      .then((res) => setSubmission(res.data))
      .catch((err) => {
        console.error(err);
      });
  }, [params]);

  const channel = get(params, 'channel', 'master');

  function handleRefresh() {
    props.onComplete();
  }

  if (!submission) {
    return (
      <div>
        <Loading/>
      </div>
    )
    return <Loading/>;
  }

  if (!assignment) {
    return <TaskNotAssignedWarning/>;
  }

  if (assignment.current_state === "complete") {
    return <TaskAlreadyCompletedWarning/>;
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
          error={error}
          onRefresh={handleRefresh}
          apiUrl={props.apiUrl}
          sdkApiUrl={props.sdkApiUrl}
          subscriptionApiUrl={props.subscriptionApiUrl}
        />
      </ErrorBoundary>
    </div>
  )
}
