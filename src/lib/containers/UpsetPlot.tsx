import React, { useState, useEffect } from 'react'
import UpSetJS, { extractSets, generateCombinations, ISetLike, UpSetFontSizes } from '@upsetjs/react'
import { QueryBundleRequest } from 'lib/utils/synapseTypes'
import { SynapseConstants, SynapseClient } from 'lib/utils'
import { SizeMe } from 'react-sizeme'
import getColorPallette from './ColorGradient'

export type UpsetPlotProps = {
  entityId: string, // table/view entity ID
  sql: string, // first column should contain values, second column should contain a single set value.  ie. SELECT distinct individualID, assay FROM syn20821313
  maxBarCount?: number // will show all if not set
  setName?: string // instead of "Set Size"
  combinationName?: string // instead of "Intersection Size"
  height?: number
  loadingScreen: JSX.Element
  token?: string
}

/**
 * Upset plot.  See https://medium.com/@sgratzl/upset-js-javascript-tutorial-1b84bfd6896d
 * Currently this is driven by a Synapse Table/View, but we may want to alter it to read in the data from a flat file instead.
 */
const UpsetPlot: React.FunctionComponent<UpsetPlotProps> = ({
  entityId,
  sql,
  maxBarCount,
  setName,
  combinationName,
  height = 700,
  loadingScreen,
  token,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>()
  const [sets, setSets] = useState<any>()
  const [combinations, setCombinations] = useState<any>()
  const [selection, setSelection] = React.useState(null as ISetLike<any> | null)

  const { colorPalette } = getColorPallette(0, 1)
  const updateFontSizes: UpSetFontSizes = {
    setLabel: '14px'
  }

  useEffect(() => {
    let isCancelled: boolean = false
    const getPlotData = async () => {
      setIsLoading(true)

      const partMask = SynapseConstants.BUNDLE_MASK_QUERY_RESULTS
      const queryRequest: QueryBundleRequest = {
        partMask,
        concreteType: 'org.sagebionetworks.repo.model.table.QueryBundleRequest',
        entityId,
        query: {
          sql
        },
      }
      const {
        queryResult
      } = await SynapseClient.getFullQueryTableResults(
        queryRequest,
        token
      )
      // transform query data into plot data, and store.
      // collect all values for each key
      const keyValuesMap = {}
      // keyValuesMap looks like { 'A': {name: 'A', sets: ['S1', 'S2'] }, 'B': { name: 'B', sets: ['S1'] }, ... }
      // It's a little redudant, but makes the next step much easier.
      
      const caseInsensitiveSetNames = {}
      // caseInsensitiveSetNames looks like { 'RNASEQ': 'rnaSeq', 'NOMe-SEQ': 'NOMe-seq'}.

      for (const row of queryResult.queryResults.rows) {
        for (let j = 1; j < row.values.length; j += 1) {
          const rowValues: any = row.values
          const key = rowValues[0]
          let newValue = rowValues[j]
          keyValuesMap[key] = keyValuesMap[key] || {}
          keyValuesMap[key].name = key

          keyValuesMap[key].sets = keyValuesMap[key].sets || []
          const found = keyValuesMap[key].sets.find((v: any) => v == newValue)
          if (!found) {
            if (caseInsensitiveSetNames[newValue.toUpperCase()]) {
              newValue = caseInsensitiveSetNames[newValue.toUpperCase()]
            } else {
              caseInsensitiveSetNames[newValue.toUpperCase()] = newValue
            }
            keyValuesMap[key].sets.push(newValue)
          }
        }
      }
      // now create the expected elems set
      const elems: any[] = Object.values(keyValuesMap)
      // elems looks like [{ name: 'A', sets: ['S1', 'S2'] }, { name: 'B', sets: ['S1'] }, ...]
      const sets = extractSets(elems);
      const combinations = generateCombinations(sets, {
        type: 'intersection',
        min: 1,
        limit: maxBarCount,
        order: 'cardinality:desc',
      })
      if (!isCancelled) {
        setSets(sets)
        setCombinations(combinations)
        setIsLoading(false)
      }
    }
    getPlotData()
    return () => {
      isCancelled = true
    }
  }, [entityId, sql, token])

  return (
    <>
      {isLoading && loadingScreen}
      {!isLoading && sets && combinations &&
        <SizeMe>
          {({ size }) => (
            <div className='UpsetPlot'>
              <UpSetJS
                sets={sets}
                combinations={combinations}
                width={size.width!} height={height}
                onHover={setSelection}
                // onClick={gotoFilesRoute()}
                selection={selection} 
                color={colorPalette[0]}
                selectionColor={colorPalette[1]}
                hasSelectionOpacity={1.0}
                // alternatingBackgroundColor={false}
                setName={setName}
                combinationName={combinationName}
                fontFamily='Lato sans-serif'
                fontSizes={updateFontSizes}
              />
            </div>            
          )}
        </SizeMe>
      }
    </>
  )
}

export default UpsetPlot