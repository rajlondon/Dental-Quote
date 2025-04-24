import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Tooth {
  id: number;
  name: string;
  condition: string | null;
  treatment: string | null;
  notes: string;
  // 3D position properties
  position: {
    arch: 'upper' | 'lower';
    side: 'left' | 'right';
    index: number;
    x: number;
    y: number;
    z: number;
    rotation: {
      x: number;
      y: number;
      z: number;
    };
  };
}

interface DentalChart3DThreeProps {
  onTeethUpdate?: (teeth: Tooth[]) => void;
  initialTeeth?: Tooth[];
  patientEmail?: string;
  patientName?: string;
  chartId?: string;
  readOnly?: boolean;
}

export function DentalChart3DThree({
  onTeethUpdate,
  initialTeeth,
  patientEmail,
  patientName,
  chartId,
  readOnly = false
}: DentalChart3DThreeProps) {
  const { toast } = useToast();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [selectedTooth, setSelectedTooth] = React.useState<Tooth | null>(null);
  const [selectedMode, setSelectedMode] = React.useState<'condition' | 'treatment'>('condition');
  const [openDialog, setOpenDialog] = React.useState(false);
  
  // Generate teeth with 3D positioning
  const generateTeethWithPositions = (): Tooth[] => {
    const upperTeeth: Tooth[] = [];
    const lowerTeeth: Tooth[] = [];
    
    // Define the teeth positions in a U shape
    for (let i = 0; i < 16; i++) {
      // Calculate angle along the arch
      const angleUpper = Math.PI - (i * Math.PI / 15);
      const angleLower = Math.PI + (i * Math.PI / 15);
      
      // Upper teeth (1-16)
      upperTeeth.push({
        id: i + 1,
        name: `Upper ${i < 8 ? 'Right' : 'Left'} ${getToothType(i < 8 ? i : 15 - i)}`,
        condition: null,
        treatment: null,
        notes: '',
        position: {
          arch: 'upper',
          side: i < 8 ? 'right' : 'left',
          index: i < 8 ? i : 15 - i,
          x: 5 * Math.cos(angleUpper),
          y: 1,
          z: 5 * Math.sin(angleUpper),
          rotation: {
            x: 0,
            y: angleUpper - Math.PI/2,
            z: 0
          }
        }
      });
      
      // Lower teeth (17-32)
      lowerTeeth.push({
        id: i + 17,
        name: `Lower ${i < 8 ? 'Left' : 'Right'} ${getToothType(i < 8 ? i : 15 - i)}`,
        condition: null,
        treatment: null,
        notes: '',
        position: {
          arch: 'lower',
          side: i < 8 ? 'left' : 'right',
          index: i < 8 ? i : 15 - i,
          x: 5 * Math.cos(angleLower),
          y: -1,
          z: 5 * Math.sin(angleLower),
          rotation: {
            x: 0,
            y: angleLower - Math.PI/2,
            z: 0
          }
        }
      });
    }
    
    // Combine and sort by ID
    return [...upperTeeth, ...lowerTeeth].sort((a, b) => a.id - b.id);
  };
  
  // Helper to get the tooth type based on index
  const getToothType = (index: number): string => {
    switch(index) {
      case 0: return "Third Molar";
      case 1: return "Second Molar";
      case 2: return "First Molar";
      case 3: return "Second Premolar";
      case 4: return "First Premolar";
      case 5: return "Canine";
      case 6: return "Lateral Incisor";
      case 7: return "Central Incisor";
      default: return "Unknown";
    }
  };
  
  // Default teeth array with all 32 adult teeth with 3D positions
  const [teeth, setTeeth] = React.useState<Tooth[]>(initialTeeth || generateTeethWithPositions());
  
  // Condition options
  const conditionOptions = [
    { value: 'normal', label: 'Normal/Healthy' },
    { value: 'chipped', label: 'Chipped/Cracked' },
    { value: 'missing', label: 'Missing' },
    { value: 'painful', label: 'Painful/Sensitive' },
    { value: 'discolored', label: 'Discolored' },
    { value: 'loose', label: 'Loose' },
    { value: 'gumIssue', label: 'Gum Issue' },
    { value: 'decay', label: 'Decay/Cavity' },
  ];
  
  // Treatment options
  const treatmentOptions = [
    { value: 'none', label: 'No Treatment Needed' },
    { value: 'implant', label: 'Dental Implant' },
    { value: 'crown', label: 'Dental Crown' },
    { value: 'veneer', label: 'Veneer' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'rootCanal', label: 'Root Canal' },
    { value: 'extraction', label: 'Extraction' },
    { value: 'whitening', label: 'Whitening' },
    { value: 'filling', label: 'Filling' },
  ];
  
  // Get color for tooth based on condition and treatment
  const getToothColor = (tooth: Tooth) => {
    if (tooth.condition === 'missing') return 0xd1d5db; // Gray for missing
    if (tooth.condition === 'chipped') return 0xfcd34d; // Yellow for chipped
    if (tooth.condition === 'painful') return 0xef4444; // Red for painful
    if (tooth.condition === 'discolored') return 0xa78bfa; // Purple for discolored
    if (tooth.condition === 'loose') return 0xfb923c; // Orange for loose
    if (tooth.condition === 'gumIssue') return 0xf87171; // Light red for gum issue
    if (tooth.condition === 'decay') return 0x92400e; // Brown for decay
    
    if (tooth.treatment === 'implant') return 0x22c55e; // Green for implant
    if (tooth.treatment === 'crown') return 0x3b82f6; // Blue for crown
    if (tooth.treatment === 'veneer') return 0x06b6d4; // Cyan for veneer
    if (tooth.treatment === 'bridge') return 0x8b5cf6; // Purple for bridge
    if (tooth.treatment === 'rootCanal') return 0xf43f5e; // Pink for root canal
    if (tooth.treatment === 'extraction') return 0x94a3b8; // Gray for extraction
    if (tooth.treatment === 'whitening') return 0xfafafa; // White for whitening
    if (tooth.treatment === 'filling') return 0x84cc16; // Lime for filling
    
    return 0xffffff; // Default white
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // Add gums (upper and lower arches)
    const upperGumGeometry = new THREE.TorusGeometry(5, 1.5, 16, 32, Math.PI);
    const lowerGumGeometry = new THREE.TorusGeometry(5, 1.5, 16, 32, Math.PI);
    
    const gumMaterial = new THREE.MeshPhongMaterial({ color: 0xf87171 });
    
    const upperGum = new THREE.Mesh(upperGumGeometry, gumMaterial);
    upperGum.rotation.x = Math.PI;
    upperGum.position.y = 1;
    scene.add(upperGum);
    
    const lowerGum = new THREE.Mesh(lowerGumGeometry, gumMaterial);
    lowerGum.position.y = -1;
    scene.add(lowerGum);
    
    // Add tongue
    const tongueGeometry = new THREE.SphereGeometry(2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const tongueMaterial = new THREE.MeshPhongMaterial({ color: 0xe57373 });
    const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongue.rotation.x = Math.PI;
    tongue.position.set(0, -1.5, 0);
    tongue.scale.z = 1.5;
    scene.add(tongue);
    
    // Add teeth
    teeth.forEach((tooth) => {
      const toothGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const toothMaterial = new THREE.MeshPhongMaterial({ 
        color: getToothColor(tooth),
        specular: 0x111111,
        shininess: 30
      });
      
      const toothMesh = new THREE.Mesh(toothGeometry, toothMaterial);
      
      // Position according to tooth data
      toothMesh.position.set(
        tooth.position.x,
        tooth.position.y,
        tooth.position.z
      );
      
      // Set rotation
      toothMesh.rotation.set(
        tooth.position.rotation.x,
        tooth.position.rotation.y,
        tooth.position.rotation.z
      );
      
      // Add tooth ID
      const loader = new THREE.FontLoader();
      
      // Use simple approach with a sprite for text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.font = 'Bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tooth.id.toString(), 32, 32);
      }
      
      const numberTexture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: numberTexture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.5, 0.5, 0.5);
      
      toothMesh.add(sprite);
      toothMesh.userData = { tooth };
      
      scene.add(toothMesh);
    });
    
    // Handle resizing
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [teeth]);
  
  // Handle tooth click
  const handleToothClick = (tooth: Tooth) => {
    setSelectedTooth(tooth);
    setOpenDialog(true);
  };
  
  // Update tooth condition or treatment
  const updateTooth = (option: string) => {
    if (!selectedTooth) return;
    
    const updatedTeeth = teeth.map(tooth => {
      if (tooth.id === selectedTooth.id) {
        return {
          ...tooth,
          [selectedMode]: option === 'normal' || option === 'none' ? null : option
        };
      }
      return tooth;
    });
    
    setTeeth(updatedTeeth);
    
    if (onTeethUpdate) {
      onTeethUpdate(updatedTeeth);
    }
    
    setOpenDialog(false);
    
    toast({
      title: "Updated Successfully",
      description: `Tooth ${selectedTooth.id} has been updated`,
    });
  };
  
  // Update tooth notes
  const updateToothNotes = (notes: string) => {
    if (!selectedTooth) return;
    
    const updatedTeeth = teeth.map(tooth => {
      if (tooth.id === selectedTooth.id) {
        return {
          ...tooth,
          notes
        };
      }
      return tooth;
    });
    
    setTeeth(updatedTeeth);
    
    if (onTeethUpdate) {
      onTeethUpdate(updatedTeeth);
    }
  };
  
  return (
    <div className="dental-chart-container">
      <div>
        {/* Simple Header with Reset Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Dental Chart (3D)</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const resetTeeth = teeth.map(tooth => ({
                ...tooth,
                condition: null,
                treatment: null,
                notes: ''
              }));
              setTeeth(resetTeeth);
              if (onTeethUpdate) {
                onTeethUpdate(resetTeeth);
              }
              toast({
                title: "Dental Chart Reset",
                description: "All teeth have been reset to normal",
              });
            }}
          >
            Reset
          </Button>
        </div>
        
        {/* Simple Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800">
          <p className="mb-1"><strong>How to Use This Tool:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click on any tooth in the diagram</li>
            <li>Mark its current condition (chipped, missing, painful, etc.)</li>
            <li>Indicate your desired treatment (implant, crown, veneer, etc.)</li>
            <li>Add any notes specific to that tooth</li>
            <li>Continue marking all teeth that need attention</li>
          </ol>
        </div>
        
        {/* 3D Mouth Canvas */}
        <div
          ref={mountRef}
          className="w-full h-80 rounded-lg border border-gray-200 overflow-hidden mb-4"
        />
        
        {/* Legend for desktop */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          {[...conditionOptions, ...treatmentOptions].map(option => (
            option.value !== 'normal' && option.value !== 'none' && (
              <div key={option.value} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1" 
                  style={{ 
                    backgroundColor: option.value === 'normal' || option.value === 'none' 
                      ? '#ffffff' 
                      : `#${getToothColor({ ...teeth[0], condition: option.value === 'normal' ? null : (conditionOptions.find(o => o.value === option.value) ? option.value : null), treatment: option.value === 'none' ? null : (treatmentOptions.find(o => o.value === option.value) ? option.value : null) }).toString(16).padStart(6, '0')}`
                  }}
                ></div>
                <span>{option.label}</span>
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* Tooth Selection Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTooth ? selectedTooth.name : 'Select a Tooth'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTooth && (
            <div className="flex justify-center items-center p-2">
              <div 
                className="h-20 w-20 flex items-center justify-center rounded-full border-4 border-gray-400 font-bold text-xl"
                style={{ 
                  backgroundColor: `#${getToothColor(selectedTooth).toString(16).padStart(6, '0')}`,
                  color: selectedTooth.condition === 'painful' || selectedTooth.treatment === 'rootCanal' || selectedTooth.treatment === 'crown' ? '#ffffff' : '#000000'
                }}
              >
                {selectedTooth.id}
              </div>
            </div>
          )}
          
          <Tabs defaultValue="condition" onValueChange={(value) => setSelectedMode(value as 'condition' | 'treatment')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="condition">Condition</TabsTrigger>
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="condition">
              <div className="p-4">
                <RadioGroup 
                  defaultValue={selectedTooth?.condition || 'normal'}
                  onValueChange={updateTooth}
                >
                  {conditionOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <RadioGroupItem value={option.value} id={`condition-${option.value}`} />
                      <Label htmlFor={`condition-${option.value}`} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ 
                          backgroundColor: option.value === 'normal' 
                            ? '#ffffff' 
                            : `#${getToothColor({ ...teeth[0], condition: option.value, treatment: null }).toString(16).padStart(6, '0')}` 
                        }}
                      ></div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="treatment">
              <div className="p-4">
                <RadioGroup 
                  defaultValue={selectedTooth?.treatment || 'none'}
                  onValueChange={updateTooth}
                >
                  {treatmentOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <RadioGroupItem value={option.value} id={`treatment-${option.value}`} />
                      <Label htmlFor={`treatment-${option.value}`} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ 
                          backgroundColor: option.value === 'none' 
                            ? '#ffffff' 
                            : `#${getToothColor({ ...teeth[0], condition: null, treatment: option.value }).toString(16).padStart(6, '0')}` 
                        }}
                      ></div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="p-4 pt-0">
            <Label htmlFor="notes" className="text-sm font-medium block mb-1">Notes</Label>
            <textarea 
              id="notes"
              className="w-full h-20 border border-gray-300 rounded-md p-2 text-sm"
              value={selectedTooth?.notes || ''}
              onChange={(e) => updateToothNotes(e.target.value)}
              placeholder="Add any notes about this tooth..."
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}