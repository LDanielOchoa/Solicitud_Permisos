'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Search, FileSpreadsheet } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import * as XLSX from 'xlsx'

interface Record {
  id: number
  code: string
  name: string
  telefono: string
  tipo: 'permiso' | 'solicitud'
  novedad: string 
  hora: string
  fecha_inicio: string
  fecha_fin: string
  description: string
  respuesta: string
  solicitud: string
  request_type: 'permiso' | 'solicitud'
}

export default function HistoricalRecords() {
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
    return week.toString();
  };

  const [records, setRecords] = useState<Record[]>([])
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all');
  const [weekFilter, setWeekFilter] = useState<string>(() => getCurrentWeek());
  const [loading, setLoading] = useState(true);


  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/historical-records?week=${weekFilter}`)
      const data = await response.json()
      setRecords(data)
      setFilteredRecords(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching records:', error)
      setLoading(false)
    }
  }, [weekFilter])

  useEffect(() => {
    fetchRecords()
  }, [weekFilter, fetchRecords])

  const filterRecords = useCallback(() => {
    let filtered = [...records]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.tipo === filterType)
    }

    setFilteredRecords(filtered)
  }, [searchTerm, filterType, records])

  useEffect(() => {
    filterRecords()
  }, [searchTerm, filterType, records, filterRecords])

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => ({
      'Código': record.code,
      'Nombre': record.name,
      'Teléfono': record.telefono,
      'Tipo': record.tipo,
      'Novedad': record.novedad,
      'Hora': record.hora,
      'Fecha Inicio': record.fecha_inicio,
      'Fecha Fin': record.fecha_fin,
      'Descripción': record.description,
      'Respuesta': record.respuesta
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Registros')
    XLSX.writeFile(wb, 'registros_historicos.xlsx')
  }

  const exportToExcelPermisos = async () => {
    try {
      const templateResponse = await fetch('/excel/Novedad_conductor_semana.xlsx');
      if (!templateResponse.ok) {
        throw new Error(`HTTP error! status: ${templateResponse.status}`);
      }
      const templateArrayBuffer = await templateResponse.arrayBuffer();
  
      const workbook = XLSX.read(new Uint8Array(templateArrayBuffer), { type: 'array' });
  
      const response = await fetch('http://localhost:8000/excel-permisos');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const permisosData = await response.json();
  
      const wsName = 'Novedad conductor';
      let ws = workbook.Sheets[wsName];
      if (!ws) {
        throw new Error(`Worksheet "${wsName}" not found in the template`);
      }
  
      let rowIndex = 2; // Comienza en la fila 3

      // Asegúrate de que permisosData es un arreglo de tipo Record[]
      permisosData.forEach((record: Record) => {
        let startDate = record.fecha_inicio;
        let endDate = record.fecha_fin;

        if (record.fecha_inicio && record.fecha_inicio.includes(',')) {
          startDate = record.fecha_inicio.split(',')[0].trim();
        }

        if (record.fecha_fin && record.fecha_fin.includes(',')) {
          endDate = record.fecha_fin.split(',')[1].trim();
        }

        ws[`A${rowIndex}`] = { v: record.code };     
        ws[`B${rowIndex}`] = { v: startDate };       
        ws[`C${rowIndex}`] = { v: endDate };         
        ws[`D${rowIndex}`] = { v: record.novedad };  
        rowIndex++;
      });

      // Asegúrate de que ws['!ref'] no sea undefined antes de usar decode_range
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        range.e.r = rowIndex - 1;
        ws['!ref'] = XLSX.utils.encode_range(range);
      } else {
        // Si !ref no está definido, crea una referencia nueva
        ws['!ref'] = `A1:D${rowIndex - 1}`;
      }

      // Guarda el archivo Excel
      XLSX.writeFile(workbook, 'Novedad_conductor_actualizado.xlsx');

    } catch (error) {
      console.error('Error exporting Excel permisos:', error);
    }
  };

  const generateWeekOptions = () => {
    const options = []
    for (let i = 1; i <= 52; i++) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          Semana {i}
        </SelectItem>
      )
    }
    return options
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registro Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o nombre..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="permiso">Permiso</SelectItem>
              <SelectItem value="equipo">Equipo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={weekFilter} onValueChange={setWeekFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por semana" />
            </SelectTrigger>
            <SelectContent>
              {generateWeekOptions()}
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
          <Button 
            onClick={exportToExcelPermisos} 
            className="w-full md:w-auto"
            variant="secondary"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel Permisos
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Novedad</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Respuesta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    Cargando registros...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    No se encontraron registros para la semana {weekFilter}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.code}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.telefono}</TableCell>
                    <TableCell>{record.tipo}</TableCell>
                    <TableCell>{record.novedad}</TableCell>
                    <TableCell>{record.fecha_inicio}</TableCell>
                    <TableCell>{record.fecha_fin}</TableCell>
                    <TableCell>{record.hora}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.description}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.respuesta}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
