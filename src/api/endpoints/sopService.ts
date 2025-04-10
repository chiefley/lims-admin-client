// src/api/endpoints/sopService.ts

// ... [keeping all the imports and existing code before the mock functions] ...

/**
 * Mock data for a specific analytical batch SOP detail when the API is unavailable
 */
function getMockAnalyticalBatchSopDetail(sopId: number): AnalyticalBatchSopRs {
  // Base SOP details
  const sop: AnalyticalBatchSopRs = {
    batchSopId: sopId,
    name: `Mock Analytical SOP ${sopId}`,
    sop: `AN-00${sopId}`,
    version: '1.0',
    sopGroup: 'Analytical Methods',
    labId: 1001,
    significantDigits: 3,
    instrumentTypeId: 1,
    suppressLoqsForComputedAnalytes: false,
    requiresMoistureCorrection: true,
    requiresServingAndContainerResults: false,
    reportPercentType: 1,
    concentrationScaleFactor: 1.0,
    percentScaleFactor: 100.0,
    measuredUnits: 'mg/L',
    reportingUnits: 'mg/kg',
    rsaUseNominalValues: false,
    rsaNominalSampleWeightG: null,
    rsaNominalExtractionVolumeL: null,
    analysisMethodType: 1,
    aggregateRollupMethodType: 1,
    lLoqComparisonType: 1,
    uLoqComparisonType: 1,
    actionLimitComparisonType: 1,
    rollupRsd: false,
    allPartialAnalyteResults: false,
    batchCount: 3,
    analyticalBatchSopControlSampleRss: [
      {
        analyticalBatchSopControlSampleId: 201,
        analyticalBatchSopId: sopId,
        sopBatchPositionType: 1,
        everyNSamples: 10,
        controlSampleOrder: 1,
        qCFactor1: 2,
        qCFactor2: 3,
        qCTargetRangeLow: 80,
        qCTargetRangeHigh: 120,
        historicalDays: 30,
        controlSampleAnalyteSopSpecificationRss: [
          {
            controlSampleAnalyteSopSpecificationId: 301,
            analyticalBatchSopControlSampleId: 201,
            analyteId: 1,
            expectedRecovery: 100.0,
            qCType: 1,
          },
        ],
      },
      {
        analyticalBatchSopControlSampleId: 202,
        analyticalBatchSopId: sopId,
        sopBatchPositionType: 3,
        everyNSamples: 20,
        controlSampleOrder: 2,
        qCFactor1: 1,
        qCFactor2: 2,
        qCTargetRangeLow: 85,
        qCTargetRangeHigh: 115,
        historicalDays: 30,
        controlSampleAnalyteSopSpecificationRss: [
          {
            controlSampleAnalyteSopSpecificationId: 302,
            analyticalBatchSopControlSampleId: 202,
            analyteId: 2,
            expectedRecovery: 95.0,
            qCType: 1,
          },
        ],
      },
    ],
    analyticalBatchSopAnalytesRss: [
      {
        analyticalBatchSopAnalyteId: 401,
        analyticalBatchSopId: sopId,
        analyteId: 1,
        computed: false,
        computeAggregateAnalyte: false,
        isInternalStandard: false,
        warningStd: 2,
        confidenceStd: 3,
        testStd: 4,
        analystDisplayOrder: 1,
        computedAnalyteConstituentRss: [],
      },
      {
        analyticalBatchSopAnalyteId: 402,
        analyticalBatchSopId: sopId,
        analyteId: 2,
        computed: false,
        computeAggregateAnalyte: false,
        isInternalStandard: true,
        warningStd: 1,
        confidenceStd: 2,
        testStd: 3,
        analystDisplayOrder: 2,
        computedAnalyteConstituentRss: [],
      },
      {
        analyticalBatchSopAnalyteId: 403,
        analyticalBatchSopId: sopId,
        analyteId: 3,
        computed: true,
        computeAggregateAnalyte: true,
        isInternalStandard: false,
        warningStd: null,
        confidenceStd: null,
        testStd: null,
        analystDisplayOrder: 3,
        computedAnalyteConstituentRss: [
          {
            computedAnalyteConstituentId: 501,
            analyticalBatchSopAnalyteId: 403,
            analyteId: 1,
            cas: '71-43-2',
          },
          {
            computedAnalyteConstituentId: 502,
            analyticalBatchSopAnalyteId: 403,
            analyteId: 2,
            cas: '108-88-3',
          },
        ],
      },
    ],
    sopAnalysisReviewComponentRss: [
      {
        sopAnalysisReviewComponentId: 601,
        analyticalBatchSopId: sopId,
        componentName: 'RetentionTime',
        displayName: 'Retention Time',
        parameter: 'RT',
        collection: 'Chromatography',
      },
      {
        sopAnalysisReviewComponentId: 602,
        analyticalBatchSopId: sopId,
        componentName: 'PeakArea',
        displayName: 'Peak Area',
        parameter: 'Area',
        collection: 'Chromatography',
      },
    ],
    prepBatchSopAnalyticalBatchSopRss: [
      {
        prepBatchSopAnalyticalBatchSopId: 701,
        prepBatchSopId: 1,
        analyticalBatchSopId: sopId,
        effectiveDate: new Date().toISOString(),
      },
      {
        prepBatchSopAnalyticalBatchSopId: 702,
        prepBatchSopId: 2,
        analyticalBatchSopId: sopId,
        effectiveDate: new Date().toISOString(),
      },
    ],
    sopProcedures: [
      {
        sopProcedureId: 801,
        batchSopId: sopId,
        section: 'Sample Preparation',
        procedureName: 'Sample Extraction',
        procedureItems: [
          {
            sopProcedurItemId: 901,
            sopProcedureId: 801,
            order: 1,
            itemNumber: '1',
            text: 'Clean all equipment with appropriate solvent.',
            indentLevel: 0,
          },
          {
            sopProcedurItemId: 902,
            sopProcedureId: 801,
            order: 2,
            itemNumber: '2',
            text: 'Prepare extraction solution according to specifications.',
            indentLevel: 0,
          },
          {
            sopProcedurItemId: 903,
            sopProcedureId: 801,
            order: 3,
            itemNumber: '3',
            text: 'Extract samples using the validated method.',
            indentLevel: 0,
          },
        ],
      },
      {
        sopProcedureId: 802,
        batchSopId: sopId,
        section: 'Analysis',
        procedureName: 'Instrumental Analysis',
        procedureItems: [
          {
            sopProcedurItemId: 904,
            sopProcedureId: 802,
            order: 1,
            itemNumber: '1',
            text: 'Calibrate instrument according to specifications.',
            indentLevel: 0,
          },
          {
            sopProcedurItemId: 905,
            sopProcedureId: 802,
            order: 2,
            itemNumber: '2',
            text: 'Run samples in order specified by batch protocol.',
            indentLevel: 0,
          },
        ],
      },
    ],
    sopFields: [
      {
        sopFieldId: 1001,
        batchSopId: sopId,
        section: 'Instrument',
        name: 'InstrumentId',
        displayName: 'Instrument',
        row: 1,
        column: 1,
        batchPropertyName: 'InstrumentId',
        required: true,
        readOnly: false,
        requiredMessage: 'Please select an instrument',
        minValueMessage: null,
        maxValueMessage: null,
        regexMessage: null,
        $type: 'InstrumentTypeSopFieldRs',
        instrumentTypeId: 1,
      } as InstrumentTypeSopFieldRs, // Type casting to the appropriate type

      {
        sopFieldId: 1002,
        batchSopId: sopId,
        section: 'Parameters',
        name: 'Column',
        displayName: 'Column',
        row: 2,
        column: 1,
        batchPropertyName: 'ColumnId',
        required: true,
        readOnly: false,
        requiredMessage: 'Please select a column',
        minValueMessage: null,
        maxValueMessage: null,
        regexMessage: null,
        $type: 'LabAssetSopFieldRs',
        labAssetTypeId: 1,
      } as LabAssetSopFieldRs, // Type casting to the appropriate type
    ],
    decimalFormatType: 1,
  };

  return sop;
}

// ... [keeping the rest of the file] ...

// Replace the export default section at the end of your sopService.ts file with this:

// Export all functions individually and also as a default object
export default {
  fetchSelectors,
  fetchBatchSopSelections,
  fetchAnalyticalBatchSopSelections,
  fetchPrepBatchSopDetail,
  fetchAnalyticalBatchSopRs,
  fetchCompounds,
  savePrepBatchSop,
  saveAnalyticalBatchSop,
  savePrepBatchSopSelection,
  fetchPanels,
  savePanel,
};
