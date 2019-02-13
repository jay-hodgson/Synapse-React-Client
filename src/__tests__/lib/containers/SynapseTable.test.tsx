import * as React from 'react'
import { shallow } from 'enzyme'
import SynapseTable, { SynapseTableProps, SORT_STATE } from '../../../lib/containers/SynapseTable'
import { QueryWrapperChildProps } from '../../../lib/containers/QueryWrapper'
import syn16787123Json from '../../../mocks/syn16787123.json'
import { SynapseConstants } from '../../../lib'
import { QueryResultBundle } from '../../../lib/utils/jsonResponses/Table/QueryResultBundle'
import { cloneDeep } from '../../../lib/utils/modules'

const createShallowComponent = (props: SynapseTableProps & QueryWrapperChildProps) => {
  const wrapper = shallow(
      <SynapseTable
        {...props}
      />
    )
  const instance = wrapper.instance() as SynapseTable
  return { wrapper, instance }
}

describe('basic functionality', () => {
  // setup tests
  const title = 'studies'
  const synapseId = 'syn16787123'
  const castData = syn16787123Json as QueryResultBundle
  const totalColumns = 13
  const lastQueryRequest = {
    concreteType: 'org.sagebionetworks.repo.model.table.QueryBundleRequest',
    partMask:
      SynapseConstants.BUNDLE_MASK_QUERY_COLUMN_MODELS |
      SynapseConstants.BUNDLE_MASK_QUERY_FACETS |
      SynapseConstants.BUNDLE_MASK_QUERY_RESULTS
    ,
    query: {
      sql: 'SELECT * FROM syn16787123',
      isConsistent: false,
      limit: 25,
      offset: 0,
      selectedFacets: [
        {
          columnName: 'projectStatus',
          concreteType: 'org.sagebionetworks.repo.model.table.FacetColumnValuesRequest',
          facetValues: [
            'Active',
            'Completed',
          ],
        },
        {
          columnName: 'tumorType',
          concreteType: 'org.sagebionetworks.repo.model.table.FacetColumnValuesRequest',
          facetValues: [
            'org.sagebionetworks.UNDEFINED_NULL_NOTSET',
            'Cutaneous Neurofibroma',
            'JMML',
            'Low Grade Glioma',
            'MPNST',
            'Plexiform Neurofibroma',
            'Plexiform Neurofibroma | MPNST',
            'Plexiform Neurofibroma | MPNST | Cutaneous Neurofibroma',
            'Schwannoma',
            'Schwannoma | Meningioma',
            'SMN'
          ],
        }
      ]
    }
  }
  const getLastQueryRequest = jest.fn(() => cloneDeep(lastQueryRequest))
  const executeQueryRequest = jest.fn()

  const props = {
    lastQueryRequest,
    getLastQueryRequest,
    executeQueryRequest,
    synapseId,
    title,
    data: castData,
  } as SynapseTableProps & QueryWrapperChildProps

  it('renders without crashing', async () => {
    const { wrapper } = createShallowComponent(props)
    expect(wrapper).toBeDefined()
  })

  describe('dropdown column menu works', () => {
    it('renders dropdown column menu', async () => {
      const { wrapper } = createShallowComponent(props)
      // there are a total of 13 columns in view, so we expect
      // 13 list elements
      expect(wrapper.find('li.SRC-table-dropdown-list')).toHaveLength(totalColumns)
    })

    it('toggle column selection functions correctly', async () => {
      const visibleColumnCount = 3
      const propsWithVisibleColumnCountSet = {
        ...props,
        visibleColumnCount
      }
      const { wrapper, instance } = createShallowComponent(propsWithVisibleColumnCountSet)
      const eventStub = {
        preventDefault: jest.fn()
      } as any
      // arbitrary value chosen for column selected
      await instance.toggleColumnSelection(5)(eventStub)
      expect(wrapper.state('isColumnSelected')).toEqual(
        [true, true, true, false, false, true, false, false, false, false, false, false, false]
      )
    })
  })

  describe('create table headers works', () => {
    it('renders correctly', () => {
      const { wrapper } = createShallowComponent(props)
      // there are a total of 13 columns in view, so we expect
      // 13 headers
      expect(wrapper.find('th')).toHaveLength(totalColumns)
      // there are five facets for the dataset so there should be 5
      // faceted columns
      expect(wrapper.find('div.SRC-table-facet-dropdown')).toHaveLength(5)
      // if visible column count isn't set then nothing should be hidden
      expect(wrapper.find('th.SRC-hidden')).toHaveLength(0)
    })

    it('handle column sort press works', async () => {
      /*
        Overview:
          Go through clicking a column's sort button, there are
          three states that cycle:
            - off
            - descending
            - ascending
      */
      const { wrapper, instance } = createShallowComponent(props)
      // simulate having clicked the sort button on the first column
      // projectName -- this should set it to descend
      const sortedColumn = 'projectName'
      const columnClickInformation = {
        index: 0,
        name: 'projectName'
      }
      const eventStub = {} as any
      await instance.handleColumnSortPress(columnClickInformation)(eventStub)
      const projectNameIconDescending = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      const descendingColumnObject = {
        column: sortedColumn,
        direction: SORT_STATE[1]
      }
      const projectNameColumnDescending = [descendingColumnObject]
      expect(wrapper.state('columnIconSortState')).toEqual(projectNameIconDescending)
      expect(wrapper.state('sortedColumnSelection')).toEqual(projectNameColumnDescending)
      // below we match only the part of the object that we expect to have changed
      expect(executeQueryRequest).toHaveBeenCalledWith(expect.objectContaining(
        {
          query: expect.objectContaining(
            {
              sort: [descendingColumnObject]
            }
          )
        }
      ))

      // simulate second button click
      // simulate having clicked the sort button on the first column
      // projectName -- this should set it to descend
      await instance.handleColumnSortPress(columnClickInformation)(eventStub)
      const projectNameIconAscending = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      const ascendingColumnObject = {
        column: sortedColumn,
        direction: SORT_STATE[2]
      }
      const projectNameColumnAscending = [ascendingColumnObject]
      expect(wrapper.state('columnIconSortState')).toEqual(projectNameIconAscending)
      expect(wrapper.state('sortedColumnSelection')).toEqual(projectNameColumnAscending)
      // below we match only the part of the object that we expect to have changed
      expect(executeQueryRequest).toHaveBeenCalledWith(expect.objectContaining(
        {
          query: expect.objectContaining(
            {
              sort: [ascendingColumnObject]
            }
          )
        }
      ))
      // simulate second button click
      // simulate having clicked the sort button on the first column
      // projectName -- this should set it to descend
      await instance.handleColumnSortPress(columnClickInformation)(eventStub)
      const projectNameIconOff = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      // it shouldn't be in the api call at all
      const projectNameColumnOff: any = []
      expect(wrapper.state('columnIconSortState')).toEqual(projectNameIconOff)
      expect(wrapper.state('sortedColumnSelection')).toEqual(projectNameColumnOff)
      // below we match only the part of the object that we expect to have changed
      expect(executeQueryRequest).toHaveBeenCalledWith(expect.objectContaining(
        {
          query: expect.objectContaining(
            {
              sort: []
            }
          )
        }
      ))
    })

  })

})