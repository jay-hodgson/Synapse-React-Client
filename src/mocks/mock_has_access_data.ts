import { RestrictionInformationResponse, RestrictionLevel } from 'lib/utils/jsonResponses/RestrictionInformation'

export const mockUnmetControlledDataRestrictionInformation: RestrictionInformationResponse = {
  restrictionLevel:RestrictionLevel.CONTROLLED_BY_ACT,
  hasUnmetAccessRequirement:true,
}

export const mockOpenRestrictionInformation: RestrictionInformationResponse = {
  restrictionLevel:RestrictionLevel.OPEN,
  hasUnmetAccessRequirement:false,
}