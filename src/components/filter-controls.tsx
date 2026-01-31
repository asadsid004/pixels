import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { FlipHorizontal2, FlipVertical2 } from "lucide-react";

export interface Adjustments {
    brightness: number;
    contrast: number;
    vignette: number;
    scale: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    aspectRatio: string;
}

const ASPECT_RATIOS = [
    { id: 'original', label: 'Original' },
    { id: '1:1', label: 'Square' },
    { id: '4:3', label: '4:3' },
    { id: '16:9', label: '16:9' },
];

interface FilterControlsProps {
    selectedFilter: string;
    onFilterChange: (filterName: string) => void;
    adjustments: Adjustments;
    onAdjustmentChange: (key: keyof Adjustments, value: unknown) => void;
    onReset: () => void;
    isProcessing: boolean;
    wasmLoaded: boolean;
}

const FILTERS = [
    { id: 'none', label: 'None' },
    { id: 'grayscale', label: 'Grayscale' },
    { id: 'invert', label: 'Invert' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'lofi', label: 'Lo-Fi' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
];

export function FilterControls({
    selectedFilter,
    onFilterChange,
    adjustments,
    onAdjustmentChange,
    onReset,
    isProcessing,
    wasmLoaded,
}: FilterControlsProps) {
    return (
        <Card className="rounded-md shadow-none mx-auto w-full">
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium uppercase">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        Reset All
                    </Button>
                </div>

                <div className="flex gap-2 flex-wrap pb-2">
                    {FILTERS.map((filter) => (
                        <Button
                            key={filter.id}
                            variant={selectedFilter === filter.id ? "default" : "outline"}
                            onClick={() => onFilterChange(filter.id)}
                            disabled={!wasmLoaded || isProcessing}
                            className="min-w-[100px]"
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium mb-3 uppercase">Adjustments</h3>

                    {/* Brightness */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <label htmlFor="brightness" className="font-medium text-xs text-muted-foreground uppercase">Brightness</label>
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">{adjustments.brightness > 0 ? '+' : ''}{adjustments.brightness}</span>
                        </div>
                        <Slider
                            id="brightness"
                            min={-100}
                            max={100}
                            step={1}
                            value={[adjustments.brightness]}
                            onValueChange={(vals) => onAdjustmentChange('brightness', vals[0])}
                            disabled={!wasmLoaded || isProcessing}
                        />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <label htmlFor="contrast" className="font-medium text-xs text-muted-foreground uppercase">Contrast</label>
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">{adjustments.contrast > 0 ? '+' : ''}{adjustments.contrast}</span>
                        </div>
                        <Slider
                            id="contrast"
                            min={-100}
                            max={100}
                            step={1}
                            value={[adjustments.contrast]}
                            onValueChange={(vals) => onAdjustmentChange('contrast', vals[0])}
                            disabled={!wasmLoaded || isProcessing}
                        />
                    </div>

                    {/* Vignette */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <label htmlFor="vignette" className="font-medium text-xs text-muted-foreground uppercase">Vignette</label>
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">{Math.round(adjustments.vignette * 100)}%</span>
                        </div>
                        <Slider
                            id="vignette"
                            min={0}
                            max={1}
                            step={0.01}
                            value={[adjustments.vignette]}
                            onValueChange={(vals) => onAdjustmentChange('vignette', vals[0])}
                            disabled={!wasmLoaded || isProcessing}
                        />
                    </div>

                    {/* Scale */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <label htmlFor="scale" className="font-medium text-xs text-muted-foreground uppercase">Scale</label>
                            <span className="font-mono text-xs tabular-nums text-muted-foreground">{Math.round(adjustments.scale * 100)}%</span>
                        </div>
                        <Slider
                            id="scale"
                            min={0.1}
                            max={2}
                            step={0.1}
                            value={[adjustments.scale]}
                            onValueChange={(vals) => onAdjustmentChange('scale', vals[0])}
                            disabled={!wasmLoaded || isProcessing}
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-medium uppercase">Transform</h3>

                        {/* Flip Controls */}
                        <div className="flex gap-2">
                            <Button
                                variant={adjustments.flipHorizontal ? "default" : "outline"}
                                size="sm"
                                onClick={() => onAdjustmentChange('flipHorizontal', !adjustments.flipHorizontal)}
                            >
                                <FlipHorizontal2 className="h-4 w-4" /> Flip H
                            </Button>
                            <Button
                                variant={adjustments.flipVertical ? "default" : "outline"}
                                size="sm"
                                onClick={() => onAdjustmentChange('flipVertical', !adjustments.flipVertical)}
                            >
                                <FlipVertical2 className="h-4 w-4" /> Flip V
                            </Button>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {ASPECT_RATIOS.map(ratio => (
                                <Button
                                    key={ratio.id}
                                    variant={adjustments.aspectRatio === ratio.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onAdjustmentChange('aspectRatio', ratio.id)}
                                >
                                    {ratio.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
