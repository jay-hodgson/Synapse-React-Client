import * as React from 'react'
import { FileEntity } from '../utils/jsonResponses/FileEntity'
import { uploadFile, createEntity } from '../utils/SynapseClient'
import { FileUploadComplete } from '../utils/jsonResponses/FileUploadComplete'
import { default as Form } from 'react-jsonschema-form'

const schema = {
  title: 'IDG DREAM Round 2 Survey',
  type: 'object',
  required: ['file'],
  properties: {
    file: {
      type: 'string',
      format: 'data-url',
      title: 'Submission File'
    },
    custom: {
      type: 'string', title: 'If you used any \'named\' algorithms or methods, please list them here',
      default: ''
    },
    multipleChoicesList: {
      type: 'array',
      title: 'What public training data did you use?',
      items: {
        type: 'string',
        enum: [
          'DrugTargetCommons',
          'IDG Pharos',
          'ChEMBL',
          'Drug-Target Explorer'
        ]
      },
      uniqueItems: true
    },
    toggle: {
      title: 'Did you use any private data?',
      type: 'boolean',
      oneOf: [
        {
          title: 'Yes',
          const: true
        },
        {
          title: 'No',
          const: false
        }
      ]
    }
  }
}
const uiSchema = {
  multipleChoicesList: {
    'ui:widget': 'checkboxes'
  },
  toggle: {
    'ui:widget': 'radio'
  }
}
type DemoChallengeSubmissionFormState = {
  token?: string,
  error?: Error,
  isUploading?: boolean,
  successfullyUploaded: boolean
}

export type DemoChallengeSubmissionFormProps = {
  token?: string,
  parentContainerId: string
}

export default class DemoChallengeSubmissionForm
  extends React.Component<DemoChallengeSubmissionFormProps, DemoChallengeSubmissionFormState> {
  private readonly inputOpenFileRef: React.RefObject<HTMLInputElement>

  constructor(props: DemoChallengeSubmissionFormProps) {
    super(props)
    this.state = {
      token: '',
      isUploading: false,
      successfullyUploaded: false,
    }
    this.inputOpenFileRef = React.createRef()
  }

  showOpenFileDlg = () => {
    if (this.inputOpenFileRef && this.inputOpenFileRef.current) {
      this.inputOpenFileRef.current.click()
    }
  }

  finishedProcessing = () => {
    this.setState(
      {
        isUploading: false,
        successfullyUploaded: true
      })
  }

  onError = (error: any) => {
    this.finishedProcessing()
    this.setState({ error })
  }

  onSubmit = ({ formData }: any) => {
    this.setState(
      {
        isUploading: true,
        successfullyUploaded: false
      })

    const submissionFileAndForm: Blob = new Blob([JSON.stringify(formData)], {
      type: 'text/json'
    })
    this.createEntityFile(submissionFileAndForm)
  }

  createEntityFile = (fileContentsBlob: Blob) => {
    const newFileEntity: FileEntity = {
      parentId: this.props.parentContainerId,
      name: `${Math.floor(Date.now() / 1000).toString()}.json`,
      concreteType: 'org.sagebionetworks.repo.model.FileEntity',
      dataFileHandleId: '',
    }
    uploadFile(this.props.token, newFileEntity.name, fileContentsBlob).then(
      (fileUploadComplete: FileUploadComplete) => {
        newFileEntity.dataFileHandleId = fileUploadComplete.fileHandleId
        createEntity(newFileEntity, this.props.token).then(() => {
          this.finishedProcessing()
        })
      }).catch((error: any) => {
        this.onError(error)
      })
  }

  render() {
    return (
      <div>
        {
          !this.state.isUploading &&
          !this.state.successfullyUploaded &&
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={this.onSubmit}
            showErrorList={true}
          />
        }
        {
          this.state.isUploading &&
          <React.Fragment>
            <span style={{ marginLeft: '2px' }} className={'spinner'} />
          </React.Fragment>
        }
        {
          this.state.successfullyUploaded &&
          <span style={{ marginLeft: '10px' }}>
            Successfully created your submission!
            <a style={{ marginLeft: '2px' }} href={`https://www.synapse.org/#!Synapse:${this.props.parentContainerId}`} target="_blank">{this.props.parentContainerId}</a>
          </span>
        }
        {
          this.state.error &&
          <p>
            There's an error with the submission: {this.state.error.name}
          </p>
        }
      </div>
    )
  }
}
