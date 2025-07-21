"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Grid, InputLabel, FormControl, Select, InputAdornment, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { createUserApi } from "@/utils/apis/apiUser";
import { EGENDER, ERECORD_STATUS, EUSER_ROLES } from "@/types/typeGlobals";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  companies: any[];
}

export default function CreateUserDialog({ open, onClose, onCreated, companies }: Props) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState<EUSER_ROLES>(EUSER_ROLES.Customer);
  const [companyId, setCompanyId] = useState("");
  const [status, setStatus] = useState<ERECORD_STATUS>(ERECORD_STATUS.Active);
  const [showPwd, setShowPwd] = useState(false);

  const [contactName, setContactName] = useState("");
  const [gender, setGender] = useState<EGENDER>(EGENDER.MALE);
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState("");
  const [identityId, setIdentityId] = useState("");
  const [identityDate, setIdentityDate] = useState("");
  const [identityAddr, setIdentityAddr] = useState("");

  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPwd("");
      setRole(EUSER_ROLES.Customer);
      setCompanyId("");
      setStatus(ERECORD_STATUS.Active);
      setContactName("");
      setGender(EGENDER.MALE);
      setBirthday("");
      setAvatar("");
      setIdentityId("");
      setIdentityDate("");
      setIdentityAddr("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!email || !pwd) {
      showNotification("Please enter User ID, Email, and Password!", "warning");
      return;
    }
    if (role === EUSER_ROLES.Partner && !companyId) {
      showNotification("Please select a company for role 'Partner'!", "warning");
      return;
    }
    if (pwd.length < 6) {
      showNotification("Password must be at least 6 characters!", "warning");
      return;
    }

    try {
      setLoading(true);
      await createUserApi({
        email,
        pwd,
        role,
        companyId: companyId || undefined,
        status,
        contact: { fullname: contactName },
        gender: gender,
        birthday: birthday ? new Date(birthday) : undefined,
        avatar,
        identity_key: {
          id: identityId,
          createdAt: identityDate,
          address: identityAddr,
        },
      });
      showNotification("User created successfully", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField fullWidth label="Email" size="small" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Password"
                type={showPwd ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                size="small"
                inputProps={{ minLength: 6, maxLength: 32 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((show) => !show)} edge="end" size="small">
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as EUSER_ROLES)}>
                  {Object.values(EUSER_ROLES).map((r) => (
                    <MenuItem key={r} value={r}>
                      <EnumChip type="userRole" value={r} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {role === EUSER_ROLES.Partner && (
              <Grid size={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Company</InputLabel>
                  <Select label="Company" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                    {companies?.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={6}>
              <TextField fullWidth label="Contact Name" size="small" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" value={gender} onChange={(e) => setGender(e.target.value as EGENDER)}>
                  <MenuItem value={EGENDER.MALE}>Male</MenuItem>
                  <MenuItem value={EGENDER.FEMALE}>Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Birthday" size="small" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Avatar URL" size="small" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="ID Number" size="small" value={identityId} onChange={(e) => setIdentityId(e.target.value)} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Issue Date" size="small" value={identityDate} onChange={(e) => setIdentityDate(e.target.value)} placeholder="DD/MM/YYYY" />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Issued By" size="small" value={identityAddr} onChange={(e) => setIdentityAddr(e.target.value)} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
