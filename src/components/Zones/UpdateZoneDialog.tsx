"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { updateZoneGroupApi } from "@/utils/apis/apiZone";
import { useNotification } from "@/contexts/NotificationProvider";
import { ICarrier } from "@/types/typeCarrier";
import { COUNTRIES } from "@/utils/constants";
import { Add, Delete } from "@mui/icons-material";

export default function UpdateZoneDialog({ open, onClose, onUpdated, carriers, groupZones }: { open: boolean; onClose: () => void; onUpdated: () => void; carriers: ICarrier[]; groupZones: any[] }) {
  const { showNotification } = useNotification();
  const [carrierId, setCarrierId] = useState("");
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (groupZones && groupZones.length > 0) {
      setCarrierId(groupZones[0].carrierId || "");
      setZones(
        groupZones.map((z) => ({
          ...z,
          countryCode: z.countryCode,
          name: COUNTRIES.find((c) => c.code === z.countryCode)?.name || z.name || "",
          zone: z.zone,
        }))
      );
    } else {
      setZones([]);
    }
  }, [groupZones, open]);

  const handleAddRow = () => {
    setZones([...zones, { countryCode: "", name: "", zone: "" }]);
  };

  const handleRemoveRow = (idx: number) => {
    setZones(zones.filter((_, i) => i !== idx));
  };

  const handleEditZone = (idx: number, field: string, value: any) => {
    const newZones = [...zones];
    newZones[idx][field] = value;
    if (field === "countryCode") {
      const found = COUNTRIES.find((c) => c.code === value);
      newZones[idx].name = found?.name || "";
    }
    setZones(newZones);
  };

  const handleUpdate = async () => {
    if (!carrierId) {
      showNotification("Sub Carrier is required!", "error");
      return;
    }

    const validZones = zones
      .filter((z) => z.countryCode && z.zone)
      .map((z) => ({
        countryCode: z.countryCode,
        zone: typeof z.zone === "string" ? Number(z.zone) : z.zone,
      }));

    if (validZones.length === 0) {
      showNotification("No valid row to update!", "error");
      return;
    }

    setLoading(true);
    try {
      await updateZoneGroupApi(carrierId, validZones);
      showNotification("Zone group updated successfully!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to update zone group!", "error");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Update Zone Group</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Sub Carrier" value={carrierId} select fullWidth disabled>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <Paper variant="outlined" sx={{ p: 1, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={30}></TableCell>
                  <TableCell width={180}>Country</TableCell>
                  <TableCell width={100}>Country Code</TableCell>
                  <TableCell width={80}>Zone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {zones.map((z, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <IconButton color="error" size="small" onClick={() => handleRemoveRow(idx)}>
                        <Delete fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <TextField select value={z.countryCode} onChange={(e) => handleEditZone(idx, "countryCode", e.target.value)} sx={{ minWidth: 200 }}>
                        <MenuItem value="">--</MenuItem>
                        {COUNTRIES.map((c) => (
                          <MenuItem key={c.code} value={c.code}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Typography>{z.countryCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <TextField type="number" value={z.zone} onChange={(e) => handleEditZone(idx, "zone", e.target.value)} sx={{ maxWidth: 70 }} />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4}>
                    <Button size="small" startIcon={<Add />} onClick={handleAddRow}>
                      Add Row
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpdate} disabled={loading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
