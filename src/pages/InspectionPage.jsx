import PartInspectionViewer from '../components/dashboard/PartInspectionViewer'
import TestStatusList from '../components/dashboard/TestStatusList'
import ScorePanel from '../components/dashboard/ScorePanel'
import FirstPassYieldChart from '../components/dashboard/FirstPassYieldChart'
import ProductionQualityChart from '../components/dashboard/ProductionQualityChart'
import ReturnInspectionChart from '../components/dashboard/ReturnInspectionChart'
import DefectsTrendChart from '../components/dashboard/DefectsTrendChart'
import ActionItemsList from '../components/dashboard/ActionItemsList'
import FinalVerdictBar from '../components/dashboard/FinalVerdictBar'

export default function InspectionPage() {
  return (
    <div className="pb-20">
      {/* 4-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Part Viewer (2 cols) | Test Status (1 col) | Score (1 col) */}
        <div className="md:col-span-2">
          <PartInspectionViewer />
        </div>
        <div className="md:col-span-1">
          <TestStatusList />
        </div>
        <div className="md:col-span-1">
          <ScorePanel />
        </div>

        {/* Row 2: FPY (1 col) | PQ (1 col) | Return Inspection (2 cols) */}
        <div className="md:col-span-1">
          <FirstPassYieldChart />
        </div>
        <div className="md:col-span-1">
          <ProductionQualityChart />
        </div>
        <div className="md:col-span-2">
          <ReturnInspectionChart />
        </div>

        {/* Row 3: Defects Trend (2 cols) | Action Items (2 cols) */}
        <div className="md:col-span-2">
          <DefectsTrendChart />
        </div>
        <div className="md:col-span-2">
          <ActionItemsList />
        </div>
      </div>

      {/* Sticky bottom verdict */}
      <FinalVerdictBar />
    </div>
  )
}
