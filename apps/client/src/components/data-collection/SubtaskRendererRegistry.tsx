import type React from 'react';
import { FuelDataCollection } from './FuelDataCollection';
import { OtherEnergyCollection } from './OtherEnergyCollection';
import { InventoryCollection } from './InventoryCollection';
import { MeasurementsCollection } from './MeasurementsCollection';
import { OperationalDataCollection } from './OperationalDataCollection';
import type { Subtask, SubtaskData } from '../../types/project';

interface SubtaskProps {
    subtask: Subtask;
    onUpdateData: (id: string, data: SubtaskData) => void;
}

const registry: Record<string, React.FC<SubtaskProps>> = {
    'DATA_FUEL_LIQUID': FuelDataCollection,
    'DATA_OTHER_ENERGY': OtherEnergyCollection,
    'DATA_EQUIPMENT_INVENTORY': InventoryCollection,
    'DATA_SITE_MEASUREMENTS': MeasurementsCollection,
    'DATA_OPERATIONAL_INFO': OperationalDataCollection,
};

export const getSubtaskRenderer = (key?: string): React.FC<SubtaskProps> | undefined => {
    if (!key) return undefined;
    return registry[key];
};

