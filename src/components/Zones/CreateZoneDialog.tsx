"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createZoneApi, createZoneGroupApi } from "@/utils/apis/apiZone";
import { useNotification } from "@/contexts/NotificationProvider";
import { ICarrier } from "@/types/typeCarrier";
import { ECountryCode } from "@/types/typeGlobals";
import { IZone } from "@/types/typeZone";
import NumericInput from "../Globals/NumericInput";
import CountrySelect from "../Globals/CountrySelect";
import { COUNTRIES } from "@/utils/constants";

export default function CreateZoneDialog({ open, onClose, onCreated, carriers }: { open: boolean; onClose: () => void; onCreated: () => void; carriers: ICarrier[] }) {
  const { showNotification } = useNotification();
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState<IZone>({
    carrierId: "",
    countryCode: ECountryCode.VN,
    zone: 1,
  });
  const [loading, setLoading] = useState(false);

  const [bulkCarrierId, setBulkCarrierId] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkRows, setBulkRows] = useState<{ country: string; code: string; zone: number; isChecked: boolean }[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab(0);
    setForm({ carrierId: "", countryCode: ECountryCode.VN, zone: 1 });
    setBulkCarrierId("");
    setBulkInput("");
    setBulkRows([]);
  }, [open]);

  const handleBulkParse = () => {
    const parsed = bulkInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [col1, zoneVal] = line.split(/\t| {2,}| +/).map((s) => (s || "").trim());
        if (!col1 || !zoneVal) return { country: col1, code: "", zone: Number(zoneVal), isChecked: false };

        const codeInput = col1.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        let found = COUNTRIES.find((c) => c.code.replace(/[^A-Za-z0-9]/g, "").toUpperCase() === codeInput);

        if (!found) {
          const nameInput = col1
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
          found = COUNTRIES.find(
            (c) =>
              c.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "") === nameInput
          );
        }

        const code = found?.code || "";
        const country = found?.name || col1;
        return {
          country,
          code,
          zone: Number(zoneVal),
          isChecked: !!code && !!zoneVal,
        };
      });
    setBulkRows(parsed);
  };

  const handleBulkSubmit = async () => {
    try {
      setBulkLoading(true);
      const validRows = bulkRows
        .filter((r) => r.isChecked && r.code && r.zone)
        .map((r) => ({
          countryCode: r.code as ECountryCode,
          zone: r.zone,
        }));

      if (!bulkCarrierId) {
        showNotification("Please select a carrier!", "error");
        setBulkLoading(false);
        return;
      }
      if (validRows.length === 0) {
        showNotification("No valid rows to submit!", "error");
        setBulkLoading(false);
        return;
      }
      await createZoneGroupApi(bulkCarrierId, validRows);
      showNotification("Zone group created successfully!", "success");
      onCreated();
      handleClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to create zone group", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSingleSubmit = async () => {
    try {
      setLoading(true);
      if (!form.carrierId || !form.countryCode || !form.zone) {
        showNotification("Please fill in carrier, country and zone!", "error");
        setLoading(false);
        return;
      }
      await createZoneApi(form);
      showNotification("Zone created successfully!", "success");
      onCreated();
      handleClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to create zone", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ carrierId: "", countryCode: ECountryCode.VN, zone: 1 });
    setBulkCarrierId("");
    setBulkInput("");
    setBulkRows([]);
    setTab(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Zone</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Bulk Create (Paste from Excel)" />
          <Tab label="Single Create" />
        </Tabs>

        {/* Bulk create tab */}
        <Box hidden={tab !== 0}>
          <Stack spacing={2} mt={1}>
            <TextField label="Sub Carrier" select value={bulkCarrierId} onChange={(e) => setBulkCarrierId(e.target.value)} fullWidth>
              {carriers.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <Typography>
              Copy two columns: <b>Country Name / Country Code</b> and <b>Zone</b> from Excel and paste below (tab or multi-space separated):
              <br />
              <span style={{ color: "#888" }}>
                Example: <b>Afghanistan&nbsp;&nbsp;10</b> or <b>VN&nbsp;&nbsp;6</b>
              </span>
            </Typography>
            <TextField multiline minRows={8} placeholder={`Afghanistan\t10\nVN\t6\n...`} value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} fullWidth />
            <Button onClick={handleBulkParse} disabled={!bulkInput || !bulkCarrierId} variant="outlined">
              Parse Data
            </Button>
            {bulkRows.length > 0 && (
              <Paper sx={{ maxHeight: 260, overflow: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Country</TableCell>
                      <TableCell>Zone</TableCell>
                      <TableCell>Country Code</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkRows.map((r, idx) => (
                      <TableRow key={idx} sx={!r.code ? { bgcolor: "#fee" } : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={r.isChecked}
                            disabled={!r.code}
                            onChange={() => setBulkRows((rows) => rows.map((item, i) => (i === idx ? { ...item, isChecked: !item.isChecked } : item)))}
                          />
                        </TableCell>
                        <TableCell>{r.country}</TableCell>
                        <TableCell>{r.zone}</TableCell>
                        <TableCell>{r.code || <span style={{ color: "red" }}>Not matched</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Stack>
        </Box>

        {/* Single create tab */}
        <Box hidden={tab !== 1}>
          <Stack spacing={2} mt={1}>
            <TextField label="Sub Carrier" select value={form.carrierId} onChange={(e) => setForm({ ...form, carrierId: e.target.value })} fullWidth>
              {carriers.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <CountrySelect
              value={form.countryCode}
              onChange={(country) =>
                setForm({
                  ...form,
                  countryCode: country?.code as ECountryCode,
                })
              }
              label="Country"
              required
            />
            <NumericInput label="Zone" value={String(form.zone)} onChange={(val) => setForm({ ...form, zone: Number(val) })} fullWidth />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {tab === 0 ? (
          <Button onClick={handleBulkSubmit} variant="contained" disabled={bulkLoading || !bulkCarrierId || bulkRows.filter((r) => r.isChecked && r.code && r.zone).length === 0}>
            Create {bulkRows.filter((r) => r.isChecked && r.code && r.zone).length} Zone
          </Button>
        ) : (
          <Button onClick={handleSingleSubmit} variant="contained" disabled={!form.carrierId || !form.countryCode || !form.zone || loading}>
            Create
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
