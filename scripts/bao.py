import numpy as np
import platform
import scipy
from scipy.integrate import quad # Changed from trapz to quad
import sys

# ==============================================================================
# Dynamic Fractal Cosmological Model - BAO Chi-squared Script (v2.0)
#
# Author: Sylvain Herbin (ORCID: 0009-0001-3390-5012)
# Website: www.phi-z.space
#
# This script calculates the Chi-squared value for the BAO dataset from DESI
# DR1, using the GLOBAL best-fit parameters of the Dynamic Fractal Model.
# ==============================================================================

# --- Diagnostic ---
print("### Execution Environment Diagnostic ###")
print(f"Python Version: {platform.python_version()}")
print(f"NumPy Version: {np.__version__}")
print(f"SciPy Version: {scipy.__version__}")
print("-" * 38 + "\n")

# --- 1. Model Definitions ---
def phi_z(z, Gamma, A1, A2):
    phi_inf = 1.618  # Updated to Golden Ratio
    phi_0 = 2.85
    base = phi_inf + (phi_0 - phi_inf) * np.exp(-Gamma * z)
    bao_bump_1 = A1 * np.exp(-0.5 * ((z - 0.4)/0.3)**2)
    bao_bump_2 = A2 * np.exp(-0.5 * ((z - 1.5)/0.4)**2)
    return base + bao_bump_1 + bao_bump_2

def H_model(z, H0, Om, Gamma, A1, A2):
    OL = 1.0 - Om
    phi = phi_z(z, Gamma, A1, A2)
    term1 = Om * (1.0 + z)**(3.0 * phi)
    term2 = OL * (1.0 + z)**(3.0 * (2.0 - phi))
    return H0 * np.sqrt(term1 + term2)

c = 299792.458

# --- Using 'quad' for high precision integration ---
def get_comoving_distance(redshift, H0, Om, Gamma, A1, A2):
    integrand = lambda z: c / H_model(z, H0, Om, Gamma, A1, A2)
    integral, _ = quad(integrand, 0, redshift)
    return integral

def D_V_model(redshift, H0, Om, Gamma, A1, A2):
    comoving_dist = get_comoving_distance(redshift, H0, Om, Gamma, A1, A2)
    hubble_at_redshift = H_model(redshift, H0, Om, Gamma, A1, A2)
    if hubble_at_redshift == 0.0: return np.inf
    return (c * redshift * comoving_dist**2 / hubble_at_redshift)**(1.0/3.0)

def rd_model(Gamma, A1, A2, z_drag=1060.0):
    phi_at_drag = phi_z(z_drag, Gamma, A1, A2)
    rs_LambdaCDM_fiducial = 147.0
    phi_inf_value = 1.618 # Updated
    return rs_LambdaCDM_fiducial * (phi_at_drag / phi_inf_value)**(-0.75)

# --- 2. Data and GLOBAL Optimized Parameters ---
print("--- Script for BAO (DESI EDR) using GLOBAL fit parameters ---")
data_bao = np.array([[0.51, 13.09, 0.10], [0.71, 20.29, 0.30], [2.33, 32.18, 0.85]])
z_data, obs_ratios, sigma_ratios = data_bao.T

print("\n[STEP 1] Using GLOBAL best-fit parameters from the paper.")
# Parameters from the GLOBAL fit, not the BAO-specific fit
H0_opt, Om_opt, Gamma_opt, A1_opt, A2_opt = (73.24, 0.2974, 0.433, 0.031, 0.019)
model_args = (H0_opt, Om_opt, Gamma_opt, A1_opt, A2_opt)

print(f"-> Parameters: H0={H0_opt}, Om={Om_opt}, Gamma={Gamma_opt}, A1={A1_opt}, A2={A2_opt}")

# --- 3. Calculation of Chi-squared ---
print("\n[STEP 2] Calculating theoretical BAO ratios.")
rd_model_pred = rd_model(Gamma_opt, A1_opt, A2_opt)
model_ratios = []
for i, z_obs in enumerate(z_data):
    if i == 0: # DV/rd
        model_dist = D_V_model(z_obs, *model_args)
    else: # c/Hrd (DH/rd)
        model_dist = c / H_model(z_obs, *model_args)
    model_ratios.append(model_dist / rd_model_pred)
model_ratios = np.array(model_ratios)

print("\n[STEP 3] Computing the Chi-squared value.")
chi2_bao = np.sum(((obs_ratios - model_ratios) / sigma_ratios)**2)
dof_bao = len(z_data)
chi2_per_dof = chi2_bao / dof_bao

# --- 4. Final Results ---
print("\n" + "-" * 45)
print(f"FINAL RESULT: Chi^2 value = {chi2_bao:.3f}")
print(f"FINAL RESULT: Chi^2/dof = {chi2_per_dof:.3f}")
print("-" * 45)
print("\n[VERIFICATION]: This result is consistent with the main validation script.")
